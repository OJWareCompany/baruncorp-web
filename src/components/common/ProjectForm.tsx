"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { ProjectResponseDto } from "@/api/api-spec";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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
import LoadingButton from "@/components/LoadingButton";
import Minimap from "@/components/Minimap";
import usePatchProjectMutation from "@/mutations/usePatchProjectMutation";
import {
  PropertyTypeEnum,
  transformStringIntoNullableString,
} from "@/lib/constants";
import { getProjectQueryKey } from "@/queries/useProjectQuery";
import { useToast } from "@/components/ui/use-toast";
import UtilitiesCombobox from "@/components/combobox/UtilitiesCombobox";

const formSchema = z.object({
  organization: z
    .string()
    .trim()
    .min(1, { message: "Organization is required" }),
  propertyType: PropertyTypeEnum,
  propertyOwner: z.string().trim(),
  projectNumber: z.string().trim(),
  address: z.object({
    street1: z.string().trim(),
    street2: z.string().trim(),
    city: z.string().trim(),
    state: z.string().trim(),
    postalCode: z.string().trim(),
    country: z.string().trim(),
    fullAddress: z.string().trim(),
    coordinates: z.array(z.number()),
  }),
  utilityId: z.string().trim(),
});

type FieldValues = z.infer<typeof formSchema>;

function getFieldValues(project: ProjectResponseDto): FieldValues {
  return {
    organization: project.clientOrganization,
    propertyType: project.propertyType,
    propertyOwner: project.projectPropertyOwnerName ?? "",
    projectNumber: project.projectNumber ?? "",
    address: {
      ...project.propertyAddress,
      street2: project.propertyAddress.street2 ?? "",
      country: project.propertyAddress.country ?? "",
    },
    utilityId: project.utilityId ?? "",
  };
}

interface Props {
  project: ProjectResponseDto;
  pageType: JobDetailPageType;
}

export default function ProjectForm({ project, pageType }: Props) {
  const { data: session } = useSession();

  const isBarunCorpMember = session?.isBarunCorpMember ?? false;
  const isHome = pageType === "HOME";

  /**
   * 바른코프 멤버 ✅
   * 바른코프 멤버아닌데, 홈 ❌
   * 바른코프 멤버아닌데, 워크스페이스 ✅
   */
  const isWorker = isBarunCorpMember || !isHome;

  const form = useForm<FieldValues>({
    resolver: zodResolver(formSchema),
    defaultValues: getFieldValues(project),
  });

  const watchState = form.watch("address.state");

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { mutateAsync } = usePatchProjectMutation(project.projectId);

  async function onSubmit(values: FieldValues) {
    if (
      values.propertyType !== project.propertyType ||
      values.address.fullAddress !== project.propertyAddress.fullAddress
    ) {
      toast({
        title: "Please wait a minute",
        description: "Moving related folders in Google Drive",
      });
    }

    await mutateAsync({
      projectNumber: transformStringIntoNullableString.parse(
        values.projectNumber
      ),
      projectPropertyOwner: transformStringIntoNullableString.parse(
        values.propertyOwner
      ),
      projectPropertyType: values.propertyType,
      projectPropertyAddress: {
        ...values.address,
        country: transformStringIntoNullableString.parse(
          values.address.country
        ),
        state: values.address.state,
        street2: transformStringIntoNullableString.parse(
          values.address.street2
        ),
      },
      utilityId: values.utilityId === "" ? undefined : values.utilityId,
    })
      .then(() => {
        toast({ title: "Success" });
        queryClient.invalidateQueries({
          queryKey: getProjectQueryKey(project.projectId),
        });
      })
      .catch((error: AxiosError<ErrorResponseData>) => {
        switch (error.response?.status) {
          case 409:
            if (error.response?.data.errorCode.includes("30002")) {
              form.setError(
                "address",
                {
                  message: `${values.address.fullAddress} already exists`,
                },
                { shouldFocus: true }
              );
              return;
            }

            if (error.response?.data.errorCode.includes("30003")) {
              form.setError(
                "projectNumber",
                {
                  message: `${values.projectNumber} already exists`,
                },
                { shouldFocus: true }
              );
              return;
            }
        }

        if (
          error.response &&
          error.response.data.errorCode.filter((value) => value != null)
            .length !== 0
        ) {
          toast({
            title: error.response.data.message,
            variant: "destructive",
          });
          return;
        }
      });
  }

  useEffect(() => {
    if (project) {
      form.reset(getFieldValues(project));
    }
  }, [form, project]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="organization"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Organization</FormLabel>
              <FormControl>
                <Input {...field} disabled />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <RowItemsContainer>
          <FormField
            control={form.control}
            name="propertyType"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Property Type</FormLabel>
                <FormControl>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={!isWorker}
                  >
                    <SelectTrigger ref={field.ref}>
                      <SelectValue placeholder="Select a property type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {PropertyTypeEnum.options.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
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
                  <Input {...field} disabled={!isWorker} />
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
                  <Input {...field} disabled={!isWorker} />
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
              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col gap-2">
                  <FormItem>
                    <FormLabel required>Address</FormLabel>
                    {isWorker && (
                      <AddressSearchButton
                        ref={field.ref}
                        format="us"
                        onSelect={(value) => {
                          form.setValue(
                            "address",
                            {
                              ...value,
                              street2: "",
                            },
                            { shouldValidate: true, shouldDirty: true }
                          );
                        }}
                      />
                    )}
                    <Input
                      value={field.value.street1}
                      disabled
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
                      disabled={!isWorker}
                    />
                    <Input
                      value={field.value.city}
                      disabled
                      placeholder="City"
                    />
                    <Input
                      value={field.value.state}
                      disabled
                      placeholder="State Or Region"
                    />
                    <Input
                      value={field.value.postalCode}
                      disabled
                      placeholder="Postal Code"
                    />
                    <Input
                      value={field.value.country}
                      disabled
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
              <FormMessage className="mt-2" />
            </div>
          )}
        />
        <FormField
          control={form.control}
          name="utilityId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Utility</FormLabel>
              <FormControl>
                <UtilitiesCombobox
                  utilityId={field.value}
                  onUtilityIdChange={field.onChange}
                  state={watchState}
                  ref={field.ref}
                  modal
                  disabled={!isWorker}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {isWorker && (
          <LoadingButton
            type="submit"
            className="w-full"
            isLoading={form.formState.isSubmitting}
            disabled={!form.formState.isDirty}
          >
            Edit
          </LoadingButton>
        )}
      </form>
    </Form>
  );
}
