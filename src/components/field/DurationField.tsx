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
import usePatchAssignedTaskDurationMutation from "@/mutations/usePatchAssignedTaskDurationMutation";
import { useToast } from "@/components/ui/use-toast";
import { getJobQueryKey } from "@/queries/useJobQuery";
import { digitRegExp } from "@/lib/constants";

const formSchema = z.object({
  duration: z.string().trim(),
});

type FieldValues = z.infer<typeof formSchema>;

const getFieldValues = (duration: number | null): FieldValues => {
  return {
    duration: duration ? String(duration) : "",
  };
};

interface Props {
  duration: number | null;
  disabled?: boolean;
  assignedTaskId: string;
  jobId: string;
}

export default function DurationField({
  duration,
  assignedTaskId,
  disabled = false,
  jobId,
}: Props) {
  const { toast } = useToast();
  const form = useForm<FieldValues>({
    resolver: zodResolver(formSchema),
    defaultValues: getFieldValues(duration),
  });

  const { mutateAsync } = usePatchAssignedTaskDurationMutation(assignedTaskId);
  const queryClient = useQueryClient();

  useEffect(() => {
    form.reset(getFieldValues(duration));
  }, [duration, form]);

  if (disabled) {
    return (
      <AffixInput
        suffixElement={<span className="text-muted-foreground">min</span>}
        value={duration ? String(duration) : ""}
        className="h-9 w-[150px]"
        disabled
      />
    );
  }

  async function onSubmit(values: FieldValues) {
    const { duration } = values;

    if (duration === "") {
      toast({
        title: "Duration is required",
        variant: "destructive",
      });
      return;
    }

    await mutateAsync({
      duration: Number(values.duration),
    })
      .then(() => {
        toast({
          title: "Success",
        });
        queryClient.invalidateQueries({ queryKey: getJobQueryKey(jobId) });
      })
      .catch((error: AxiosError<ErrorResponseData>) => {
        switch (error.response?.status) {
          case 400:
            if (error.response?.data.errorCode.includes("40002")) {
              toast({
                title: "Cannot be updated after an invoice has been issued",
                variant: "destructive",
              });
            }
            if (error.response?.data.errorCode.includes("30203")) {
              toast({
                title: "Duration should be less than 128",
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
          name="duration"
          render={({ field }) => (
            <FormItem className="flex-row">
              <FormControl>
                <AffixInput
                  suffixElement={
                    <span className="text-muted-foreground">min</span>
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
