import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { AffixInput } from "@/components/AffixInput";
import usePatchOrderedServiceManualPriceMutation from "@/mutations/usePatchOrderedServiceManualPriceMutation";
import { useToast } from "@/components/ui/use-toast";
import { getJobQueryKey } from "@/queries/useJobQuery";

const formSchema = z.object({
  price: z.string().trim(),
});

type FieldValues = z.infer<typeof formSchema>;

const getFieldValues = (price: number | null): FieldValues => {
  return {
    price: price ? String(price) : "",
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
        value={price ? String(price) : ""}
        className="h-9 w-[150px]"
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

    await mutateAsync({ price: Number(price) }).then(() => {
      toast({
        title: "Success",
      });
      queryClient.invalidateQueries({ queryKey: getJobQueryKey(jobId) });
    });
  }

  return (
    <Form {...form}>
      <form
        className="flex gap-2 w-[150px]"
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
                    <span className="text-muted-foreground">$</span>
                  }
                  {...field}
                  className="h-9"
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button
          size={"icon"}
          variant={"outline"}
          className="w-9 h-9 flex-shrink-0"
          type="submit"
          disabled={!form.formState.isDirty}
        >
          <Pencil className="w-4 h-4" />
        </Button>
      </form>
    </Form>
  );
}
