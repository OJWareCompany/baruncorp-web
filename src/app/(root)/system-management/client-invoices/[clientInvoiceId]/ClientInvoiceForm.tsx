import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { addDays, format } from "date-fns";
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
import { cn, getISOStringForStartOfDayInUTC } from "@/lib/utils";
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
import usePatchInvoiceMutation from "@/mutations/usePatchInvoiceMutation";
import { getClientInvoiceQueryKey } from "@/queries/useClientInvoiceQuery";
import { useToast } from "@/components/ui/use-toast";

const formSchema = z.object({
  organization: z
    .string()
    .trim()
    .min(1, { message: "Organization is required" }),
  invoiceDate: z.date({
    required_error: "A date of birth is required.",
  }),
  terms: TermsEnum,
  servicePeriodMonth: z
    .string()
    .datetime({ message: "Service Period Month is required" }),
  notesToClient: z.string().trim(),
});

type FieldValues = z.infer<typeof formSchema>;

function getFieldValues(clientInvoice: InvoiceResponseDto): FieldValues {
  const currentDate = new Date();

  return {
    organization: clientInvoice.clientOrganization.name,
    invoiceDate: new Date(clientInvoice.invoiceDate),
    terms: String(clientInvoice.terms) as z.infer<typeof TermsEnum>,
    servicePeriodMonth: clientInvoice.servicePeriodDate,
    notesToClient: transformNullishStringIntoString.parse(
      clientInvoice.notesToClient
    ),
  };
}

interface Props {
  clientInvoice: InvoiceResponseDto;
}

export default function ClientInvoiceForm({ clientInvoice }: Props) {
  const form = useForm<FieldValues>({
    resolver: zodResolver(formSchema),
    defaultValues: getFieldValues(clientInvoice),
  });
  const watchInvoiceDate = form.watch("invoiceDate");
  const watchTerms = form.watch("terms");
  const { mutateAsync: patchInvoiceMutateAsync } = usePatchInvoiceMutation(
    clientInvoice.id
  );
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    form.reset(getFieldValues(clientInvoice));
  }, [clientInvoice, form]);

  async function onSubmit(values: FieldValues) {
    await patchInvoiceMutateAsync({
      invoiceDate: getISOStringForStartOfDayInUTC(values.invoiceDate),
      notesToClient: transformStringIntoNullableString.parse(
        values.notesToClient
      ),
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
            name="servicePeriodMonth"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Service Period Month</FormLabel>
                <FormControl>
                  <Input
                    value={format(
                      new Date(field.value.slice(0, 7)),
                      "MMM yyyy"
                    )}
                    disabled
                  />
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
                      >
                        {field.value ? (
                          format(field.value, "MM-dd-yyyy")
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
                      selected={field.value}
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
                  <Select value={field.value} onValueChange={field.onChange}>
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
              value={format(
                addDays(watchInvoiceDate, Number(watchTerms)),
                "MM-dd-yyyy"
              )}
              disabled
            />
          </Item>
        </RowItemsContainer>
        <FormField
          control={form.control}
          name="notesToClient"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes to Client</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <LoadingButton
          type="submit"
          isLoading={form.formState.isSubmitting}
          className="w-full"
          disabled={!form.formState.isDirty}
        >
          Edit
        </LoadingButton>
      </form>
    </Form>
  );
}
