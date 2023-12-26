"use client";
import { Plus, RotateCcw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useToast } from "@/components/ui/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import RowItemsContainer from "@/components/RowItemsContainer";
import { Input } from "@/components/ui/input";
import LoadingButton from "@/components/LoadingButton";
import usePostPositionMutation from "@/mutations/usePostPositionMutation";
import { Textarea } from "@/components/ui/textarea";
import {
  LicenseTypeEnum,
  LicenseTypeEnumWithEmptyString,
  digitRegExp,
  transformLicenseTypeEnumWithEmptyStringIntoNullableLicenseTypeEnum,
  transformStringIntoNullableNumber,
  transformStringIntoNullableString,
} from "@/lib/constants";
import { getPositionsQueryKey } from "@/queries/usePositionsQuery";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  name: z.string().trim().min(1, { message: "Name is required" }),
  maxAssignedTasksLimit: z.string(),
  licenseType: LicenseTypeEnumWithEmptyString,
  description: z.string().trim(),
});

type FieldValues = z.infer<typeof formSchema>;

export default function NewPositionSheet() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const [isSubmitSuccessful, setIsSubmitSuccessful] = useState(false);
  const { mutateAsync } = usePostPositionMutation();

  const form = useForm<FieldValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      maxAssignedTasksLimit: "",
      description: "",
      licenseType: "",
    },
  });

  const watchLicenseType = form.watch("licenseType");

  useEffect(() => {
    if (isSubmitSuccessful) {
      form.reset();
      setIsSubmitSuccessful(false);
    }
  }, [form, isSubmitSuccessful]);

  async function onSubmit(values: FieldValues) {
    await mutateAsync({
      name: values.name,
      maxAssignedTasksLimit: transformStringIntoNullableNumber.parse(
        values.maxAssignedTasksLimit
      ),
      description: transformStringIntoNullableString.parse(values.description),
      licenseType:
        transformLicenseTypeEnumWithEmptyStringIntoNullableLicenseTypeEnum.parse(
          values.licenseType
        ),
    })
      .then(() => {
        setOpen(false);
        setIsSubmitSuccessful(true);
        toast({
          title: "Success",
        });
        queryClient.invalidateQueries({
          queryKey: getPositionsQueryKey({
            limit: Number.MAX_SAFE_INTEGER,
          }),
        });
      })
      .catch(() => {
        // TODO
      });
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant={"outline"} size={"sm"}>
          <Plus className="mr-2 h-4 w-4" />
          New Position
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-[1400px] w-full">
        <SheetHeader className="mb-6">
          <SheetTitle>New Position</SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <RowItemsContainer>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maxAssignedTasksLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Maximum Number of Tasks Held</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        onChange={(event) => {
                          const { value } = event.target;
                          if (value === "" || digitRegExp.test(value)) {
                            field.onChange(event);
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="licenseType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>License Type</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger ref={field.ref}>
                            <SelectValue placeholder="Select a license type" />
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
                      <Button
                        size={"icon"}
                        variant={"outline"}
                        className="shrink-0"
                        disabled={watchLicenseType === ""}
                        onClick={() => {
                          form.setValue("licenseType", "", {
                            shouldDirty: true,
                            shouldValidate: true,
                          });
                        }}
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </RowItemsContainer>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <LoadingButton
              type="submit"
              className="w-full"
              isLoading={form.formState.isSubmitting}
            >
              Submit
            </LoadingButton>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
