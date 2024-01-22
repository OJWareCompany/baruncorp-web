import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import LoadingButton from "../LoadingButton";
import DatePicker from "../DatePicker";
import StatesCombobox from "../combobox/StatesCombobox";
import WorkersCombobox from "../combobox/WorkerCombobox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { LicenseTypeEnum } from "@/lib/constants";
import usePostUserLicenseMutation from "@/mutations/usePostUserLicenseMutation";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getISOStringForStartOfDayInUTC } from "@/lib/utils";

const formSchema = z.object({
  userId: z.string().trim().min(1, { message: "User is required" }),
  abbreviation: z.string().trim().min(1, { message: "State is required" }),
  type: LicenseTypeEnum,
  expiryDate: z.date().optional(),
});

type FieldValues = z.infer<typeof formSchema>;

interface Props {
  onSuccess?: () => void;
  userId?: string;
  abbreviation?: string;
  type?: LicenseTypeEnum;
  filteringIds?: string[];
}

export default function NewLicenseForm({
  onSuccess,
  userId,
  abbreviation,
  type,
  filteringIds,
}: Props) {
  const { mutateAsync } = usePostUserLicenseMutation();

  const form = useForm<FieldValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: type ?? "Structural",
      abbreviation,
      userId: userId ?? "",
    },
  });

  async function onSubmit(values: FieldValues) {
    await mutateAsync({
      userId: values.userId,
      abbreviation: values.abbreviation,
      type: values.type,
      expiryDate: values.expiryDate
        ? getISOStringForStartOfDayInUTC(values.expiryDate)
        : null,
    })
      .then(() => {
        onSuccess?.();
      })
      .catch(() => {
        // TODO
      });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="userId"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>User</FormLabel>
              <FormControl>
                <WorkersCombobox
                  userId={field.value}
                  onUserIdChange={field.onChange}
                  modal
                  ref={field.ref}
                  filteringIds={filteringIds}
                  disabled={userId !== undefined}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="abbreviation"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>State</FormLabel>
              <FormControl>
                <StatesCombobox
                  abbreviation={field.value}
                  onAbbreviationChange={field.onChange}
                  ref={field.ref}
                  disabled={abbreviation !== undefined}
                  modal
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Type</FormLabel>
              <FormControl>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={type !== undefined}
                >
                  <SelectTrigger ref={field.ref}>
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {LicenseTypeEnum.options.map((option) => (
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
          name="expiryDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expiry Date</FormLabel>
              <FormControl>
                <DatePicker {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <LoadingButton
          type="submit"
          isLoading={form.formState.isSubmitting}
          className="w-full"
        >
          Submit
        </LoadingButton>
      </form>
    </Form>
  );
}
