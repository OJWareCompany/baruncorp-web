"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRef, useState } from "react";
import { Plus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { v4 as uuidv4 } from "uuid";
import { AxiosError } from "axios";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import LoadingButton from "@/components/LoadingButton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  capitalizedStateNames,
  defaultErrorToast,
  postalCodeRegExp,
} from "@/lib/constants";
import { useToast } from "@/components/ui/use-toast";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  fetchGeocodeFeatures,
  getMapboxPlacesQueryKey,
} from "@/queries/useAddressSearchQuery";
import api from "@/api";
import RowItemsContainer from "@/components/RowItemsContainer";
import PageLoading from "@/components/PageLoading";
import usePostAhjMutation from "@/mutations/usePostAhjMutation";

const formSchema = z.object({
  address: z
    .object({
      street1: z.string().trim(),
      street2: z.string().trim(),
      city: z.string().trim(),
      state: z.string().trim(),
      postalCode: z.string().trim(),
      country: z.string().trim(),
    })
    .superRefine((value, ctx) => {
      if (value.street1.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Street 1 is required",
        });
        return;
      }
      if (value.city.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "City is required",
        });
        return;
      }
      if (value.state.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "State is required",
        });
        return;
      }
      if (value.postalCode.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Postal Code is required",
        });
        return;
      }
      if (!postalCodeRegExp.test(value.postalCode)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Invalid postal code format. Postal code should be in the format XXXXX or XXXXX-XXXX",
        });
        return;
      }
    }),
});

type FieldValues = z.infer<typeof formSchema>;
type AddressTextField = Pick<
  FieldValues["address"],
  "street1" | "street2" | "city" | "state" | "postalCode" | "country"
>;

type Ahj = {
  id: string;
  index: number;
  coordinates: [number, number];
  state: string;
  county: string | null;
  countySubdivisions: string | null;
  place: string | null;
};

enum AhjStatus {
  UNCREATED = "uncreated",
  Created = "created",
  Creating = "creating",
}

type AhjCardMetadata = {
  status: AhjStatus;
};

export default function NewAhjNoteSheet() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const [ahjs, setAhjs] = useState<Ahj[] | null>(null);
  const ahjCardMetadatasRef = useRef<AhjCardMetadata[]>([]);

  const form = useForm<FieldValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      address: {
        street1: "",
        street2: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
      },
    },
  });

  const statesOrRegionsRef = useRef(capitalizedStateNames);

  const queryClient = useQueryClient();

  async function onSubmit(_values: FieldValues) {
    toast({
      title: "Please wait a minute",
      description: "Searching AHJ Datas",
    });

    const geocodeFeatures = await queryClient.fetchQuery({
      queryKey: getMapboxPlacesQueryKey(generateAddressSearchText()),
      queryFn: fetchGeocodeFeatures,
    });

    geocodeFeatures.forEach((item) => console.log(item.geometry.coordinates));
    const coordinatesList = geocodeFeatures.map(
      (item) => item.geometry.coordinates
    );

    /**
     * @Desc
     * 무조건 이 함수 내에서 API 콜을 해야함 -> React Query를 이용해서 선언형으로 API 콜 불가
     * queryClient.fetchQuery도 사용 불가 -> 함수 바디 내에서 useApi를 사용하게 되서 에러 발생
     */
    const searchCensusPromises = coordinatesList.map((coordinates) => {
      return api.searchCensus.findSearchCensusHttpControllerSearchCensus({
        x: coordinates[0],
        y: coordinates[1],
      });
    });

    const searchCensusResponses = await Promise.all(searchCensusPromises);
    const censusDatas = searchCensusResponses
      .filter((response) => response.status === 200)
      .map((response) => response.data);

    setAhjs(
      censusDatas.map((data, index) => {
        return {
          id: uuidv4(),
          index,
          coordinates: [coordinatesList[index][0], coordinatesList[index][1]],
          state: data.state.stateLongName,
          county: data.county?.countyLongName ?? null,
          countySubdivisions: data.countySubdivisions?.longName ?? null,
          place: data.place?.placeLongName ?? null,
        };
      })
    );

    ahjCardMetadatasRef.current = censusDatas.map((_) => {
      return { status: AhjStatus.UNCREATED };
    });
  }

  const generateAddressSearchText = () => {
    const addressFields: Array<keyof AddressTextField> = [
      "street1",
      "street2",
      "city",
      "state",
      "postalCode",
      "country",
    ];

    const addressSearchText = addressFields
      .map((field) => form.getValues(`address.${field}`)?.trim())
      .filter(Boolean)
      .join(" ");

    return addressSearchText;
  };

  const usePostAhjMutationResult = usePostAhjMutation();

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      form.reset();
      setAhjs(null);
      ahjCardMetadatasRef.current = [];
    }
    setOpen(open);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button
          variant={"outline"}
          size={"sm"}
          className="text-white bg-slate-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          New AHJ Note
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-[1400px] w-full">
        <SheetHeader className="mb-6">
          <SheetTitle>New AHJ Note</SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-2">
                      <FormItem>
                        <FormLabel required>Address</FormLabel>
                        <Input
                          value={field.value.street1}
                          disabled={form.formState.isSubmitting}
                          onChange={(event) => {
                            field.onChange({
                              ...field.value,
                              street1: event.target.value,
                            });
                          }}
                          placeholder="Street 1"
                        />
                        <Input
                          value={field.value.street2}
                          disabled={form.formState.isSubmitting}
                          onChange={(event) => {
                            field.onChange({
                              ...field.value,
                              street2: event.target.value,
                            });
                          }}
                          placeholder="Street 2"
                        />
                        <Input
                          value={field.value.city}
                          disabled={form.formState.isSubmitting}
                          onChange={(event) => {
                            field.onChange({
                              ...field.value,
                              city: event.target.value,
                            });
                          }}
                          placeholder="City"
                        />
                        <Select
                          value={field.value.state}
                          disabled={form.formState.isSubmitting}
                          onValueChange={(value) => {
                            field.onChange({
                              ...field.value,
                              state: value,
                            });
                          }}
                        >
                          <SelectTrigger className="h-10 w-full">
                            <SelectValue
                              placeholder={"Select an state or region"}
                            />
                          </SelectTrigger>
                          <SelectContent
                            side="bottom"
                            className="max-h-48 overflow-y-auto"
                          >
                            {statesOrRegionsRef.current.map((state) => (
                              <SelectItem key={state} value={`${state}`}>
                                {state}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          value={field.value.postalCode}
                          disabled={form.formState.isSubmitting}
                          onChange={(event) => {
                            field.onChange({
                              ...field.value,
                              postalCode: event.target.value,
                            });
                          }}
                          placeholder="Postal Code"
                        />
                        <Input
                          value={field.value.country}
                          disabled={form.formState.isSubmitting}
                          onChange={(event) => {
                            field.onChange({
                              ...field.value,
                              country: event.target.value,
                            });
                          }}
                          placeholder="Country"
                        />
                      </FormItem>
                    </div>
                  </div>
                  <FormMessage className="mt-2" />
                </div>
              )}
            />
            <LoadingButton
              type="submit"
              className="w-full cursor-pointer"
              isLoading={form.formState.isSubmitting}
            >
              Search
            </LoadingButton>
          </form>
        </Form>
        {form.formState.isSubmitting && <PageLoading />}
        {!form.formState.isSubmitting && ahjs && ahjs.length > 0 && (
          <RowItemsContainer>
            {ahjs.map((item) => {
              const cardStatus = ahjCardMetadatasRef.current[item.index].status;
              const isLoading = cardStatus === AhjStatus.Creating;
              const disabled = cardStatus !== AhjStatus.UNCREATED;
              return (
                <Card key={item.id} className="w-[350px] mt-4 py-4">
                  <CardContent>
                    <form>
                      <div className="grid w-full items-center gap-4">
                        <div className="flex flex-col space-y-1.5">
                          <p>State</p>
                          <Input disabled value={item.state} />
                        </div>
                        <div className="flex flex-col space-y-1.5">
                          <p>County</p>
                          <Input disabled value={item.county ?? "No data"} />
                        </div>
                        {item.countySubdivisions && (
                          <div className="flex flex-col space-y-1.5">
                            <p>County Subdivisions</p>
                            <Input
                              disabled
                              value={item.countySubdivisions ?? "No data"}
                            />
                          </div>
                        )}
                        <div className="flex flex-col space-y-1.5">
                          <p>Place</p>
                          <Input disabled value={item.place ?? "No data"} />
                        </div>
                      </div>
                    </form>
                  </CardContent>
                  <CardFooter className="flex justify-between flex-row-reverse py-0">
                    <LoadingButton
                      type="button"
                      isLoading={isLoading}
                      disabled={disabled}
                      onClick={() => {
                        ahjCardMetadatasRef.current[item.index].status =
                          AhjStatus.Creating;
                        usePostAhjMutationResult
                          .mutateAsync({ coordinates: item.coordinates })
                          .then((response) => {
                            toast({
                              title: "Success",
                            });
                            ahjCardMetadatasRef.current[item.index].status =
                              AhjStatus.Created;
                            return response;
                          })
                          .catch((error: AxiosError<ErrorResponseData>) => {
                            if (error.response) {
                              toast({
                                title: error.response.data.message,
                                variant: "destructive",
                              });
                              return;
                            }
                            toast(defaultErrorToast);
                            ahjCardMetadatasRef.current[item.index].status =
                              AhjStatus.UNCREATED;
                          });
                      }}
                    >
                      {ahjCardMetadatasRef.current[item.index].status ===
                      AhjStatus.Created
                        ? "Created"
                        : "Create"}
                    </LoadingButton>
                  </CardFooter>
                </Card>
              );
            })}
          </RowItemsContainer>
        )}
      </SheetContent>
    </Sheet>
  );
}
