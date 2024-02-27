import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Pencil } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { AxiosError } from "axios";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { AffixInput } from "@/components/AffixInput";
import usePatchOrderedServiceManualPriceMutation from "@/mutations/usePatchOrderedServiceManualPriceMutation";
import { useToast } from "@/components/ui/use-toast";
import { getJobQueryKey } from "@/queries/useJobQuery";
import { toTwoDecimalRegExp } from "@/lib/constants";

const formSchema = z.object({
  price: z.string().trim(),
});

type FieldValues = z.infer<typeof formSchema>;

const getFieldValues = (price: number | null): FieldValues => {
  return {
    price: price == null ? "" : String(price),
  };
};

interface Props {
  disabled?: boolean;
  orderedServiceId: string;
  price: number | null;
  jobId: string;
}

export default function PriceField({
  disabled = false,
  jobId,
  orderedServiceId,
  price,
}: Props) {
  const form = useForm<FieldValues>({
    resolver: zodResolver(formSchema),
    defaultValues: getFieldValues(price),
  });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { mutateAsync } =
    usePatchOrderedServiceManualPriceMutation(orderedServiceId);

  useEffect(() => {
    form.reset(getFieldValues(price));
  }, [form, price]);

  if (disabled) {
    return (
      <AffixInput
        prefixElement={<span className="text-muted-foreground">$</span>}
        value={price == null ? "" : String(price)}
        className="-ml-[9px] w-[150px]"
        size="sm"
        disabled
      />
    );
  }

  async function onSubmit(values: FieldValues) {
    const { price } = values;

    if (price === "") {
      toast({
        title: "Price is required",
        variant: "destructive",
      });
      return;
    }

    await mutateAsync({ price: Number(price) })
      .then(() => {
        toast({
          title: "Success",
        });
        queryClient.invalidateQueries({ queryKey: getJobQueryKey(jobId) });
      })
      .catch((error: AxiosError<ErrorResponseData>) => {
        switch (error.response?.status) {
          case 400:
            if (error.response?.data.errorCode.includes("40302")) {
              toast({
                title: "Select Major / Minor first",
                variant: "destructive",
              });
              return;
            }

            if (error.response?.data.errorCode.includes("40002")) {
              toast({
                title: "Job cannot be updated after invoice is issued",
                variant: "destructive",
              });
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
        className="flex gap-1.5 w-[150px] -ml-[9px]"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem className="flex-row">
              <FormControl>
                <AffixInput
                  prefixElement={
                    <span className="text-muted-foreground text-sm">$</span>
                  }
                  {...field}
                  onChange={(event) => {
                    const { value } = event.target;
                    if (value === "" || toTwoDecimalRegExp.test(value)) {
                      field.onChange(event);
                    }
                  }}
                  className="data-[focused=true]:ring-0 data-[focused=true]:ring-offset-0"
                  size="sm"
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button
          size={"icon"}
          variant={"outline"}
          className="w-8 h-8 flex-shrink-0"
          type="submit"
          disabled={!form.formState.isDirty}
          onClick={(event) => {
            if (form.formState.isSubmitting) {
              event.preventDefault();
            }
          }}
        >
          {form.formState.isSubmitting ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Pencil className="w-3 h-3" />
          )}
        </Button>
      </form>
    </Form>
  );
}
