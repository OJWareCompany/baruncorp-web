import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { AxiosError } from "axios";
import { X } from "lucide-react";
import { differenceInYears } from "date-fns";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import RowItemsContainer from "../RowItemsContainer";
import OrganizationsCombobox from "../combobox/OrganizationsCombobox";
import { Checkbox } from "../ui/checkbox";
import LoadingButton from "../LoadingButton";
import DateOfJoiningDatePicker from "../DateOfJoiningDatePicker";
import { useToast } from "../ui/use-toast";
import usePostUserMutation from "@/mutations/usePostUserMutation";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  BARUNCORP_ORGANIZATION_ID,
  digitRegExp,
  transformStringIntoNullableString,
} from "@/lib/constants";
import usePtoPerTenureQuery from "@/queries/usePtoPerTenureQuery";
import { getISOStringForStartOfDayInUTC } from "@/lib/utils";

const formSchema = z
  .object({
    organizationId: z.string().trim().min(1, {
      message: "Organization is required",
    }),
    firstName: z.string().trim().min(1, {
      message: "First Name is required",
    }),
    lastName: z.string().trim().min(1, {
      message: "Last Name is required",
    }),
    phoneNumber: z.string().trim(),
    emailAddress: z
      .string()
      .trim()
      .min(1, { message: "Email Address is required" })
      .email({
        message: "Format of Email Address is incorrect",
      }),
    emailAddressesToReceiveDeliverables: z.array(
      z.object({
        email: z
          .string()
          .trim()
          .min(1, { message: "Email Address is required" })
          .email({ message: "Format of Email Address is incorrect" }),
      })
    ),
    isContractor: z.boolean(),
    dateOfJoining: z.date().optional(),
    tenure: z.string().trim(),
    pto: z.string().trim(),
  })
  .refine(
    (values) =>
      values.organizationId !== BARUNCORP_ORGANIZATION_ID ||
      values.dateOfJoining != null,
    { message: "Date of Joining is required", path: ["dateOfJoining"] }
  );

type FieldValues = z.infer<typeof formSchema>;

interface Props {
  onSuccess?: ({
    organizationId,
    userId,
    email,
  }: {
    organizationId: string;
    userId: string;
    email: string;
  }) => void;
  organizationId?: string;
}

export default function NewUserForm({ onSuccess, organizationId }: Props) {
  const form = useForm<FieldValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      organizationId: organizationId ?? "",
      emailAddress: "",
      emailAddressesToReceiveDeliverables: [{ email: "" }],
      firstName: "",
      lastName: "",
      phoneNumber: "",
      isContractor: false,
      tenure: "",
      pto: "",
    },
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "emailAddressesToReceiveDeliverables",
  });
  const usePostUserMutationResult = usePostUserMutation();
  const { toast } = useToast();

  const watchTenure = form.watch("tenure");
  const watchDateOfJoining = form.watch("dateOfJoining");
  const { data: ptoPerTenure, isLoading: isPtoPerTenureQueryLoading } =
    usePtoPerTenureQuery({
      limit: Number.MAX_SAFE_INTEGER,
    });

  useEffect(() => {
    if (
      form.formState.isSubmitSuccessful &&
      usePostUserMutationResult.isSuccess
    ) {
      form.reset();
    }
  }, [
    form,
    form.formState.isSubmitSuccessful,
    usePostUserMutationResult.isSuccess,
  ]);

  const watchOrganizationId = form.watch("organizationId");

  const isOrganizationBarunCorp =
    watchOrganizationId === BARUNCORP_ORGANIZATION_ID;

  async function onSubmit(values: FieldValues) {
    const selectedPtoPerTenure = ptoPerTenure?.items.find(
      (value) => value.tenure === Number(values.tenure)
    );

    await usePostUserMutationResult
      .mutateAsync({
        deliverablesEmails: values.emailAddressesToReceiveDeliverables.map(
          (value) => value.email
        ),
        email: values.emailAddress,
        firstName: values.firstName,
        lastName: values.lastName,
        phoneNumber: transformStringIntoNullableString.parse(
          values.phoneNumber
        ),
        organizationId: values.organizationId,
        isVendor: isOrganizationBarunCorp ? false : values.isContractor,
        dateOfJoining: isOrganizationBarunCorp
          ? getISOStringForStartOfDayInUTC(values.dateOfJoining ?? new Date())
          : null,
        tenure: isOrganizationBarunCorp ? Number(values.tenure) : 1,
        totalPtoDays: isOrganizationBarunCorp
          ? values.pto === ""
            ? selectedPtoPerTenure?.total ?? 10
            : Number(values.pto)
          : 10,
      })
      .then(({ id }) => {
        onSuccess?.({
          userId: id,
          organizationId: values.organizationId,
          email: values.emailAddress,
        });
      })
      .catch((error: AxiosError<ErrorResponseData>) => {
        switch (error.response?.status) {
          case 400:
            if (error.response?.data.errorCode.includes("10111")) {
              form.setError(
                "phoneNumber",
                {
                  message: `Phone Number is invalid`,
                },
                { shouldFocus: true }
              );
              return;
            }
          case 409:
            if (error.response?.data.errorCode.includes("10017")) {
              form.setError(
                "emailAddress",
                {
                  message: `${values.emailAddress} already exists`,
                },
                {
                  shouldFocus: true,
                }
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

  return (
    <Form {...form}>
      <form
        onSubmit={(event) => {
          event.stopPropagation();

          return form.handleSubmit(onSubmit)(event);
        }}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="organizationId"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Organization</FormLabel>
              <FormControl>
                <OrganizationsCombobox
                  organizationId={field.value}
                  onOrganizationIdChange={(newOrganizationId) => {
                    field.onChange(newOrganizationId);
                  }}
                  ref={field.ref}
                  disabled={organizationId !== undefined}
                  modal
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <RowItemsContainer>
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>First Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Last Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
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
          name="emailAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Email Address</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onChange={(event) => {
                    field.onChange(event);
                    form.setValue(
                      `emailAddressesToReceiveDeliverables.0.email`,
                      event.target.value,
                      {
                        shouldValidate: form.formState.isSubmitted,
                      }
                    );
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="emailAddressesToReceiveDeliverables"
          render={() => {
            return (
              <FormItem>
                <FormLabel required>
                  Email Addresses to Receive Deliverables
                </FormLabel>
                {fields.map((field, index) => (
                  <FormField
                    key={field.id}
                    control={form.control}
                    name={`emailAddressesToReceiveDeliverables.${index}.email`}
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex flex-row gap-2">
                          <FormControl>
                            <Input {...field} disabled={index === 0} />
                          </FormControl>
                          {index !== 0 && (
                            <Button
                              variant={"outline"}
                              size={"icon"}
                              className="flex-shrink-0"
                              onClick={() => {
                                remove(index);
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
                <Button
                  variant={"outline"}
                  className="w-full"
                  onClick={() => {
                    append({ email: "" });
                  }}
                  type="button"
                >
                  Add Email
                </Button>
              </FormItem>
            );
          }}
        />
        {!isOrganizationBarunCorp && (
          <FormField
            control={form.control}
            name="isContractor"
            render={({ field }) => (
              <FormItem className="flex-row-reverse justify-end items-center gap-3">
                <FormLabel>Contractor</FormLabel>
                <FormControl>
                  <Checkbox
                    ref={field.ref}
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        {isOrganizationBarunCorp && (
          <RowItemsContainer>
            <FormField
              control={form.control}
              name="dateOfJoining"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Date of Joining</FormLabel>
                  <FormControl>
                    <DateOfJoiningDatePicker
                      {...field}
                      onChange={(value) => {
                        field.onChange(value);
                        if (value != null) {
                          const yearsDifference = differenceInYears(
                            new Date(),
                            value
                          );
                          const tenureAsNumber = yearsDifference + 1;
                          form.setValue("tenure", String(tenureAsNumber));
                          const totalPto = ptoPerTenure?.items.find(
                            (value) => value.tenure === tenureAsNumber
                          )?.total;
                          form.setValue(
                            "pto",
                            totalPto ? String(totalPto) : "10"
                          );
                        } else {
                          form.resetField("tenure");
                          form.resetField("pto");
                        }
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Tenure and PTO are updated based on Date of Joining
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tenure"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tenure (Year)</FormLabel>
                  <FormControl>
                    <Input {...field} disabled />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pto"
              render={({ field }) => {
                const defaultTotalPto = ptoPerTenure?.items.find(
                  (value) =>
                    value.tenure ===
                    (watchTenure === "" ? 0 : Number(watchTenure))
                )?.total;

                return (
                  <FormItem>
                    <FormLabel>PTO (Days)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        onChange={(event) => {
                          const { value } = event.target;
                          if (value === "" || digitRegExp.test(value)) {
                            field.onChange(event);
                          }
                        }}
                        placeholder={
                          defaultTotalPto ? String(defaultTotalPto) : "10"
                        }
                        disabled={watchDateOfJoining === undefined}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          </RowItemsContainer>
        )}
        <LoadingButton
          type="submit"
          className="w-full"
          isLoading={form.formState.isSubmitting}
        >
          Submit
        </LoadingButton>
      </form>
    </Form>
  );
}
