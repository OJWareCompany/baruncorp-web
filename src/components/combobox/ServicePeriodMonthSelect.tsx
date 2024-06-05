import { format } from "date-fns";
import { useState } from "react";
import { AxiosError } from "axios";
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

  const organization = organizations?.clientToInvoices.find(
    (value) => value.id === organizationId
  );
  const defaultPeriodMonth = format(new Date(servicePeriodMonth), "MMM yyyy");

  const [alertDialogState, setAlertDialogState] = useState<{
    open: boolean;
    selectedMonth: string;
  }>({ open: false, selectedMonth: defaultPeriodMonth });

  return (
    <>
      <Select
        onValueChange={(newValue) => {
          setAlertDialogState({
            open: true,
            selectedMonth: newValue,
          });
        }}
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
            setAlertDialogState((prevState) => ({
              ...prevState,
              open: false,
              selectedMonth: defaultPeriodMonth,
            }));
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setAlertDialogState({ ...alertDialogState, open: false });
              }}
            >
              Cancel
            </AlertDialogCancel>
            <LoadingButton
              onClick={() => {
                patchClientInvoiceServiceMonthMutationAsync({
                  serviceMonth: format(
                    new Date(alertDialogState.selectedMonth.slice(0, 7)),
                    "yyyy-MM"
                  ),
                })
                  .then(() => {
                    toast({ title: "Success" });
                    setAlertDialogState({
                      ...alertDialogState,
                      open: false,
                      selectedMonth: defaultPeriodMonth,
                    });
                  })
                  .catch((error: AxiosError<ErrorResponseData>) => {
                    if (
                      error.response &&
                      error.response.data.errorCode.filter(
                        (value) => value != null
                      ).length !== 0
                    ) {
                      toast({
                        title: error.response.data.message,
                        variant: "destructive",
                      });
                      return;
                    }
                  });
              }}
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
