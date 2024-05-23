import { format } from "date-fns";
import { useState } from "react";
import { toast } from "../ui/use-toast";
import LoadingButton from "../LoadingButton";
import useClientsToInvoiceQuery from "@/queries/useClientsToInvoiceQuery";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import usePatchClientInvoiceServiceMonthMutation from "@/mutations/usePatchClientInvoiceServiceMonthMutation";
import useClientInvoiceQuery from "@/queries/useClientInvoiceQuery";

interface Props {
  organizationId: string;
  clientInvoiceId: string;
  servicePeriodMonth: string;
}

const ServicePeriodMonthSelect = ({
  organizationId,
  servicePeriodMonth,
  clientInvoiceId,
}: Props) => {
  const { data: organizations } = useClientsToInvoiceQuery();

  const { mutateAsync: patchClientInvoiceServiceMonthMutationAsync } =
    usePatchClientInvoiceServiceMonthMutation(clientInvoiceId);

  const { data: clientInvoice } = useClientInvoiceQuery(clientInvoiceId);

  const organization = organizations?.clientToInvoices.find(
    (value) => value.id === organizationId
  );
  const defaultPeriodMonth = format(new Date(servicePeriodMonth), "MMM yyyy");

  const [selectedMonth, setSelectedMonth] =
    useState<string>(defaultPeriodMonth);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [alertDialogState, setAlertDialogState] = useState<{
    open: boolean;
    selectedMonth: string;
  }>({ open: false, selectedMonth: defaultPeriodMonth });

  const handleValueChange = (newValue: string) => {
    if (!isSubmitting) {
      setAlertDialogState({
        open: true,
        selectedMonth: newValue,
      });
    }
  };

  const handleCancel = () => {
    setAlertDialogState({ open: false, selectedMonth: selectedMonth });
  };

  const handleContinue = async () => {
    setIsSubmitting(true);
    try {
      await patchClientInvoiceServiceMonthMutationAsync({
        serviceMonth: format(
          new Date(alertDialogState.selectedMonth),
          "yyyy-MM"
        ),
      });
      toast({ title: "Success" });
      setSelectedMonth(alertDialogState.selectedMonth);
      setAlertDialogState({ ...alertDialogState, open: false });
    } catch (error: any) {
      if (
        error.response &&
        error.response.data.errorCode.filter((value: any) => value != null)
          .length !== 0
      ) {
        toast({
          title: error.response.data.message,
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Select
        value={selectedMonth}
        onValueChange={handleValueChange}
        disabled={isSubmitting}
      >
        <SelectTrigger>
          <SelectValue placeholder={defaultPeriodMonth} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value={defaultPeriodMonth}>
              {defaultPeriodMonth}
            </SelectItem>
            {organization?.date.map((value) => (
              <SelectItem key={value} value={value}>
                {format(new Date(value.slice(0, 7)), "MMM yyyy")}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <AlertDialog
        open={alertDialogState.open}
        onOpenChange={(newOpen) => {
          if (!newOpen) {
            setAlertDialogState({ open: false, selectedMonth: selectedMonth });
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {clientInvoice?.status === "Issued" ? (
                <>
                  This invoice was already issued. <br />
                  Are you sure?
                </>
              ) : (
                "Are you sure?"
              )}
            </AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel} disabled={isSubmitting}>
              Cancel
            </AlertDialogCancel>
            <LoadingButton
              onClick={handleContinue}
              disabled={isSubmitting}
              isLoading={isSubmitting}
            >
              Continue
            </LoadingButton>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
ServicePeriodMonthSelect.displayName = "ServicePeriodMonthSelect";

export default ServicePeriodMonthSelect;
