import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { addDays } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { InvoiceResponseDto } from "@/api/api-spec";
import {
  TermsEnum,
  transformNullishStringIntoString,
  transformStringIntoNullableString,
} from "@/lib/constants";
import RowItemsContainer from "@/components/RowItemsContainer";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  cn,
  formatInUTCAsMMMYYYY,
  formatInUTCAsMMddyyyy,
  getISOStringForStartOfDayInUTC,
} from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import LoadingButton from "@/components/LoadingButton";
import { Textarea } from "@/components/ui/textarea";
import Item from "@/components/Item";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import usePatchClientInvoiceMutation from "@/mutations/usePatchClientInvoiceMutation";
import { getClientInvoiceQueryKey } from "@/queries/useClientInvoiceQuery";
import { useToast } from "@/components/ui/use-toast";
import { useProfileContext } from "@/app/(root)/ProfileProvider";
import useOrganizationQuery from "@/queries/useOrganizationQuery";

const formSchema = z.object({
  organization: z
    .string()
    .trim()
    .min(1, { message: "Organization is required" }),
  invoiceDate: z.date({
    required_error: "A date of birth is required.",
  }),
  terms: TermsEnum,
  invoiceRecipientEmail: z.string().email(),
  servicePeriodMonth: z
    .string()
    .datetime({ message: "Service Period Month is required" }),
  notes: z.string().trim(),
});

interface Props {
  clientInvoice: InvoiceResponseDto;
}

export default function ClientInvoiceForm({ clientInvoice }: Props) {
  const { isBarunCorpMember } = useProfileContext();

  const { data: organization } = useOrganizationQuery(
    clientInvoice.clientOrganization.id
  );

  type FieldValues = z.infer<typeof formSchema>;

  function getFieldValues(clientInvoice: InvoiceResponseDto): FieldValues {
    return {
      organization: clientInvoice.clientOrganization.name,
      invoiceDate: new Date(clientInvoice.invoiceDate),
      terms: String(clientInvoice.terms) as z.infer<typeof TermsEnum>,
      servicePeriodMonth: clientInvoice.servicePeriodDate,
      notes: transformNullishStringIntoString.parse(
        clientInvoice.notesToClient
      ),
      invoiceRecipientEmail: organization?.invoiceRecipientEmail ?? "",
    };
  }
  const form = useForm<FieldValues>({
    resolver: zodResolver(formSchema),
    defaultValues: getFieldValues(clientInvoice),
  });
  const watchInvoiceDate = form.watch("invoiceDate");
  const watchTerms = form.watch("terms");
  const { mutateAsync: patchClientInvoiceMutateAsync } =
    usePatchClientInvoiceMutation(clientInvoice.id);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  useEffect(() => {
    form.reset(getFieldValues(clientInvoice));
  }, [clientInvoice, form]);
  async function onSubmit(values: FieldValues) {
    await patchClientInvoiceMutateAsync({
      invoiceDate: getISOStringForStartOfDayInUTC(values.invoiceDate),
      notesToClient: transformStringIntoNullableString.parse(values.notes),
      terms: Number(values.terms) as 21 | 30 | 60,
    })
      .then(() => {
        toast({ title: "Success" });
        queryClient.invalidateQueries({
          queryKey: getClientInvoiceQueryKey(clientInvoice.id),
        });
      })
      .catch((error: AxiosError<ErrorResponseData>) => {
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <RowItemsContainer>
          <FormField
            control={form.control}
            name="organization"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Organization</FormLabel>
                <FormControl>
                  <Input value={field.value} disabled />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="invoiceRecipientEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Invoice Recipient Email</FormLabel>
                <FormControl>
                  <Input value={field.value} disabled />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="servicePeriodMonth"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Service Period Month</FormLabel>
                <FormControl>
                  <Input value={formatInUTCAsMMMYYYY(field.value)} disabled />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </RowItemsContainer>
        <RowItemsContainer>
          <FormField
            control={form.control}
            name="invoiceDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel required>Invoice Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                        disabled={!isBarunCorpMember}
                      >
                        {field.value ? (
                          formatInUTCAsMMddyyyy(field.value)
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={new Date(formatInUTCAsMMddyyyy(field.value))}
                      onSelect={(day) => {
                        if (day == null) {
                          return;
                        }
                        field.onChange(day);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="terms"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Terms</FormLabel>
                <FormControl>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={!isBarunCorpMember}
                  >
                    <SelectTrigger ref={field.ref}>
                      <SelectValue placeholder="Select a property type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {TermsEnum.options.map((option) => (
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
          <Item>
            <Label>Due Date</Label>
            <Input
              value={formatInUTCAsMMddyyyy(
                addDays(watchInvoiceDate, Number(watchTerms))
              )}
              disabled
            />
          </Item>
        </RowItemsContainer>
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea {...field} disabled={!isBarunCorpMember} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {isBarunCorpMember && (
          <LoadingButton
            type="submit"
            isLoading={form.formState.isSubmitting}
            className="w-full"
            disabled={!form.formState.isDirty}
          >
            Save
          </LoadingButton>
        )}
      </form>
    </Form>
  );
}
