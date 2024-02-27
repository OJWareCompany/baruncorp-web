import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Pencil } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useEffect } from "react";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { AffixInput } from "@/components/AffixInput";
import { useToast } from "@/components/ui/use-toast";
import { toTwoDecimalRegExp } from "@/lib/constants";
import { Label } from "@/components/ui/label";
import { VendorInvoiceResponseDto } from "@/api/api-spec";
import usePatchVendorInvoiceTotal from "@/mutations/usePatchVendorInvoiceTotal";
import { getVendorInvoiceQueryKey } from "@/queries/useVendorInvoiceQuery";

const formSchema = z.object({
  total: z.string().trim(),
});

type FieldValues = z.infer<typeof formSchema>;

const getFieldValues = (
  vendorInvoice: VendorInvoiceResponseDto
): FieldValues => {
  return {
    total: String(vendorInvoice.total),
  };
};

interface Props {
  vendorInvoice: VendorInvoiceResponseDto;
}

export default function ExpenseTotalForm({ vendorInvoice }: Props) {
  const { toast } = useToast();
  const form = useForm<FieldValues>({
    resolver: zodResolver(formSchema),
    defaultValues: getFieldValues(vendorInvoice),
  });

  const { mutateAsync } = usePatchVendorInvoiceTotal(vendorInvoice.id);
  const queryClient = useQueryClient();

  useEffect(() => {
    form.reset(getFieldValues(vendorInvoice));
  }, [form, vendorInvoice]);

  async function onSubmit(values: FieldValues) {
    const { total } = values;
    if (total === "") {
      toast({
        title: "Total is required",
        variant: "destructive",
      });
      return;
    }
    await mutateAsync({
      total: Number(values.total),
    })
      .then(() => {
        toast({
          title: "Success",
        });
        queryClient.invalidateQueries({
          queryKey: getVendorInvoiceQueryKey(vendorInvoice.id),
        });
      })
      .catch((error: AxiosError<ErrorResponseData>) => {
        // switch (error.response?.status) {
        //   case 400:
        //     if (error.response?.data.errorCode.includes("20818")) {
        //       toast({
        //         title: "TOTAL must not be greater than 50",
        //         variant: "destructive",
        //       });
        //       return;
        //     }
        // }
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
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-2"
      >
        <Label>Total</Label>
        <div className="flex gap-2">
          <FormField
            control={form.control}
            name="total"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <AffixInput
                    prefixElement={
                      <span className="text-muted-foreground">$</span>
                    }
                    {...field}
                    onChange={(event) => {
                      const { value } = event.target;
                      if (value === "" || toTwoDecimalRegExp.test(value)) {
                        field.onChange(event);
                      }
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <Button
            size={"icon"}
            variant={"outline"}
            className="w-10 h-10 flex-shrink-0"
            type="submit"
            disabled={!form.formState.isDirty}
            onClick={(event) => {
              if (form.formState.isSubmitting) {
                event.preventDefault();
              }
            }}
          >
            {form.formState.isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Pencil className="w-4 h-4" />
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

{
  /* <Item>
<Label>Total</Label>
<AffixInput
  prefixElement={<span className="text-muted-foreground">$</span>}
  value={String(vendorInvoice.total)}
  readOnly
/>
</Item> */
}
