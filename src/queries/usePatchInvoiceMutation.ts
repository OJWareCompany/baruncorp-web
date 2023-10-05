import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { UpdateInvoiceRequestDto } from "@/api";

const usePatchInvoiceMutation = (invoiceId: string) => {
  const api = useApi();

  return useMutation<
    void,
    AxiosError<ErrorResponseData>,
    UpdateInvoiceRequestDto
  >((reqData) => {
    return api.invoices
      .updateInvoiceHttpControllerPatch(invoiceId, reqData)
      .then(({ data: resData }) => resData);
  });
};

export default usePatchInvoiceMutation;
