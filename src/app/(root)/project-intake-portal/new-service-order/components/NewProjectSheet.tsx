"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { DialogProps } from "@radix-ui/react-dialog";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import RowItemsContainer from "@/components/RowItemsContainer";
import AddressSearchButton from "@/components/AddressSearchButton";
import Minimap from "@/components/Minimap";
import usePostProjectMutation from "@/queries/usePostProjectMutation";
import { schemaToConvertFromStringToNullableString } from "@/lib/constants";
import LoadingButton from "@/components/LoadingButton";

const formSchema = z.object({
  propertyType: z.enum(["Residential", "Commercial"]),
  propertyOwner: z.string(),
  projectNumber: z.string(),
  address: z
    .object({
      street1: z.string().trim().min(1, { message: "Street 1 is required" }),
      street2: z.string(),
      city: z.string().trim().min(1, { message: "City required" }),
      stateOrRegion: z
        .string()
        .trim()
        .min(1, { message: "State / Region is required" }),
      postalCode: z
        .string()
        .trim()
        .min(1, { message: "Postal Code is required" }),
      country: z.string().trim().min(1, { message: "Country is required" }),
      fullAddress: z
        .string()
        .trim()
        .min(1, { message: "Full Address is required" }),
      coordinates: z
        .array(z.number())
        .min(1, { message: "Coordinates is required" }),
    })
    .superRefine((value, ctx) => {
      if (value.fullAddress.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Address is required",
          path: ["root"],
        });
      }
    }),
});

interface Props extends DialogProps {
  selectedOrganizationId: string;
  onSelect: (newProjectId: string) => void;
}

// TODO: org가 이미 project address를 가지고 있다면 에러 메시지를 띄워주어야 함
// TODO: 주소 수정은 언제 가능해야 하는지? 주소는 중요한 키라서 수정하도록 하는 것은 영향이 끼칠 수 있다. draggable?
// TODO: default property type을 org마다 설정할 수 있도록 해서, 그 값이 new project의 기본값으로 들어갈 수 있게
export default function NewProjectSheet({
  selectedOrganizationId,
  onSelect,
  ...dialogProps
}: Props) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      propertyType: "Residential", // TOOD: default value of organization
      propertyOwner: "",
      projectNumber: "",
      address: {
        street1: "",
        street2: "",
        city: "",
        stateOrRegion: "",
        postalCode: "",
        country: "",
        fullAddress: "",
        coordinates: [],
      },
    },
  });
  const { mutateAsync } = usePostProjectMutation();
  const queryClient = useQueryClient();

  useEffect(() => {
    form.reset();
  }, [form, selectedOrganizationId]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const {
      address: {
        city,
        coordinates,
        country,
        fullAddress,
        postalCode,
        stateOrRegion,
        street1,
        street2,
      },
      propertyOwner,
      projectNumber,
      propertyType,
    } = values;

    await mutateAsync({
      clientOrganizationId: selectedOrganizationId,
      projectPropertyOwner:
        schemaToConvertFromStringToNullableString.parse(propertyOwner),
      projectNumber:
        schemaToConvertFromStringToNullableString.parse(projectNumber),
      projectPropertyType: propertyType,
      projectPropertyAddress: {
        coordinates,
        city,
        country,
        fullAddress,
        postalCode,
        state: stateOrRegion,
        street1,
        street2,
      },
    })
      .then(({ id }) => {
        dialogProps.onOpenChange?.(false);
        onSelect(id);
        form.reset();
        queryClient.invalidateQueries({
          queryKey: [
            "projects",
            "list",
            { organizationId: selectedOrganizationId },
          ],
        });
      })
      .catch(() => {});
  }

  return (
    <Sheet {...dialogProps}>
      <SheetContent className="sm:max-w-[1400px] w-full overflow-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>New Project</SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <RowItemsContainer>
              <FormField
                control={form.control}
                name="propertyType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Property Type</FormLabel>
                    <FormControl>
                      <Select {...field} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a property type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="Residential">
                              Residential
                            </SelectItem>
                            <SelectItem value="Commercial">
                              Commercial
                            </SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="propertyOwner"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Owner</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="projectNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Number</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </RowItemsContainer>
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex flex-col gap-2">
                      <FormItem>
                        <FormLabel required>Address</FormLabel>
                        <AddressSearchButton
                          format="us"
                          onSelect={({
                            street1,
                            city,
                            stateOrRegion,
                            postalCode,
                            country,
                            fullAddress,
                            coordinates,
                          }) => {
                            form.setValue(
                              "address",
                              {
                                street1,
                                street2: "",
                                city: city ?? "",
                                stateOrRegion: stateOrRegion ?? "",
                                postalCode: postalCode ?? "",
                                country: country ?? "",
                                fullAddress,
                                coordinates,
                              },
                              { shouldValidate: true, shouldDirty: true }
                            );
                          }}
                        />
                        <Input
                          value={field.value.street1}
                          readOnly
                          placeholder="Street 1"
                        />
                        <Input
                          value={field.value.street2}
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
                          readOnly
                          placeholder="City"
                        />
                        <Input
                          value={field.value.stateOrRegion}
                          readOnly
                          placeholder="State Or Region"
                        />
                        <Input
                          value={field.value.postalCode}
                          readOnly
                          placeholder="Postal Code"
                        />
                        <Input
                          value={field.value.country}
                          readOnly
                          placeholder="Country"
                        />
                      </FormItem>
                    </div>
                    <div className="col-span-2">
                      <Minimap
                        longitude={field.value.coordinates[0]}
                        latitude={field.value.coordinates[1]}
                      />
                    </div>
                  </div>
                  <FormMessage className="mt-2" root />
                </div>
              )}
            />
            <LoadingButton
              type="submit"
              className="w-full"
              isLoading={form.formState.isSubmitting}
            >
              Create
            </LoadingButton>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
