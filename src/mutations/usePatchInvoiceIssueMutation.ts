import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { IssueInvoiceRequestDto } from "@/api";

const usePatchInvoiceIssueMutation = (invoiceId: string) => {
  const api = useApi();

  return useMutation<
    void,
    AxiosError<ErrorResponseData>,
    IssueInvoiceRequestDto
  >((reqData) => {
    return api.invoices
      .issueInvoiceHttpControllerPatch(invoiceId, reqData)
      .then(({ data: resData }) => resData);
  });
};

export default usePatchInvoiceIssueMutation;
