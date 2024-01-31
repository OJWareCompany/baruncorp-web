"use client";
import { Plus } from "lucide-react";
import { useParams } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import CustomPricingForm from "./CustomPricingForm";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import CreatableCustomPricingCombobox from "@/components/combobox/CreatableCustomPricingCombobox";
import useServiceQuery from "@/queries/useServiceQuery";
import useOrganizationQuery from "@/queries/useOrganizationQuery";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import PageLoading from "@/components/PageLoading";

const formSchema = z.object({
  serviceId: z.string(),
});

type FieldValues = z.infer<typeof formSchema>;

export default function NewCustomPricingSheet() {
  const [open, setOpen] = useState(false);
  const { organizationId } = useParams() as { organizationId: string };

  const form = useForm<FieldValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      serviceId: "",
    },
  });
  const watchServiceId = form.watch("serviceId");

  const {
    data: service,
    isSuccess: isServiceQuerySuccess,
    isLoading: isServiceQueryLoading,
  } = useServiceQuery(watchServiceId);
  const { data: organization, isSuccess: isOrganizationQuerySuccess } =
    useOrganizationQuery(organizationId);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant={"outline"} size={"sm"}>
          <Plus className="mr-2 h-4 w-4" />
          New Custom Pricing
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-[1400px] w-full">
        <SheetHeader className="mb-6">
          <SheetTitle>New Custom Pricing</SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form>
            <FormField
              control={form.control}
              name="serviceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Scope</FormLabel>
                  <FormControl>
                    <CreatableCustomPricingCombobox
                      organizationId={organizationId}
                      serviceId={field.value}
                      onServiceIdChange={(newServiceId) => {
                        field.onChange(newServiceId);
                        form.clearErrors();
                      }}
                      modal
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        {watchServiceId !== "" && isServiceQueryLoading && (
          <PageLoading isPageHeaderPlaceholder={false} />
        )}
        {isServiceQuerySuccess && isOrganizationQuerySuccess && (
          <CustomPricingForm
            onSuccess={() => {
              setOpen(false);
            }}
            service={service}
            organization={organization}
            serviceIdForm={form}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}
