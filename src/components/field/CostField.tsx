import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Pencil } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import LoadingButton from "../LoadingButton";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { AffixInput } from "@/components/AffixInput";
import { useToast } from "@/components/ui/use-toast";
import { getJobQueryKey } from "@/queries/useJobQuery";
import { toTwoDecimalRegExp } from "@/lib/constants";
import usePatchAssignedTaskManualCostMutation from "@/mutations/usePatchAssignedTaskManualCostMutation";

const formSchema = z.object({
  cost: z.string().trim(),
});

type FieldValues = z.infer<typeof formSchema>;

const getFieldValues = (cost: number | null): FieldValues => {
  return {
    cost: cost == null ? "" : String(cost),
  };
};

interface Props {
  disabled?: boolean;
  assignedTaskId: string;
  cost: number | null;
  jobId: string;
  vendorInvoiceId: string | null;
}

export default function CostField({
  disabled = false,
  jobId,
  assignedTaskId,
  cost,
  vendorInvoiceId,
}: Props) {
  const form = useForm<FieldValues>({
    resolver: zodResolver(formSchema),
    defaultValues: getFieldValues(cost),
  });
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { mutateAsync } =
    usePatchAssignedTaskManualCostMutation(assignedTaskId);

  useEffect(() => {
    form.reset(getFieldValues(cost));
  }, [form, cost]);

  if (disabled) {
    return (
      <AffixInput
        prefixElement={<span className="text-muted-foreground">$</span>}
        value={cost == null ? "" : String(cost)}
        className="-ml-[9px] w-[150px]"
        size="sm"
        disabled
      />
    );
  }

  async function handleFormSubmit(values: FieldValues) {
    const { cost } = values;

    if (cost === "") {
      toast({
        title: "Cost is required",
        variant: "destructive",
      });
      return;
    }

    await mutateAsync({ cost: Number(cost) })
      .then(() => {
        toast({
          title: "Success",
        });
        queryClient.invalidateQueries({ queryKey: getJobQueryKey(jobId) });
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

  const onSubmit = (values: FieldValues) => {
    if (vendorInvoiceId) {
      setAlertDialogOpen(true);
    } else {
      handleFormSubmit(values);
    }
  };

  const confirmSubmit = () => {
    handleFormSubmit(form.getValues());
    setAlertDialogOpen(false);
  };

  const cancelSubmit = () => {
    form.reset(getFieldValues(cost));
    setAlertDialogOpen(false);
  };

  return (
    <Form {...form}>
      <form
        className="flex gap-1.5 w-[150px] -ml-[9px]"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name="cost"
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
      <AlertDialog
        open={alertDialogOpen}
        onOpenChange={(newOpen) => setAlertDialogOpen(newOpen)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              When you edit a price, the price on the vendor invoice may be
              modified.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelSubmit}>Cancel</AlertDialogCancel>
            <LoadingButton
              isLoading={form.formState.isSubmitting}
              onClick={confirmSubmit}
            >
              Continue
            </LoadingButton>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Form>
  );
}
