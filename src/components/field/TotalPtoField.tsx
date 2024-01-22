import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useEffect } from "react";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { AffixInput } from "@/components/AffixInput";
import { useToast } from "@/components/ui/use-toast";
import { digitRegExp } from "@/lib/constants";
import usePatchPtoTotalMutation from "@/mutations/usePatchPtoTotalMutation";
import { getPtosQueryKey } from "@/queries/usePtosQuery";

const formSchema = z.object({
  pto: z.string().trim(),
});

type FieldValues = z.infer<typeof formSchema>;

const getFieldValues = (pto: number): FieldValues => {
  return {
    pto: String(pto),
  };
};

interface Props {
  id: string;
  pto: number;
}

export default function TotalPtoField({ id, pto }: Props) {
  const { toast } = useToast();
  const form = useForm<FieldValues>({
    resolver: zodResolver(formSchema),
    defaultValues: getFieldValues(pto),
  });

  const { mutateAsync } = usePatchPtoTotalMutation(id);
  const queryClient = useQueryClient();

  useEffect(() => {
    form.reset(getFieldValues(pto));
  }, [pto, form]);

  async function onSubmit(values: FieldValues) {
    const { pto } = values;

    if (pto === "") {
      toast({
        title: "PTO is required",
        variant: "destructive",
      });
      return;
    }

    await mutateAsync({
      total: Number(values.pto),
    })
      .then(() => {
        toast({
          title: "Success",
        });
        queryClient.invalidateQueries({
          queryKey: getPtosQueryKey({}),
        });
      })
      .catch((error: AxiosError<ErrorResponseData>) => {
        switch (error.response?.status) {
          case 400:
            if (error.response?.data.errorCode.includes("20818")) {
              toast({
                title: "PTO must not be greater than 50",
                variant: "destructive",
              });
            }
            if (error.response?.data.errorCode.includes("20815")) {
              toast({
                title: "You cannot set it lower than the number of used PTO",
                variant: "destructive",
              });
            }
            break;
        }
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
          name="pto"
          render={({ field }) => (
            <FormItem className="flex-row">
              <FormControl>
                <AffixInput
                  suffixElement={
                    <span className="text-muted-foreground">Days</span>
                  }
                  {...field}
                  onChange={(event) => {
                    const { value } = event.target;
                    if (value === "" || digitRegExp.test(value)) {
                      field.onChange(event);
                    }
                  }}
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
