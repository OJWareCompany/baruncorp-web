import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { IdResponse, ModifyPeriodMonthRequestDto } from "@/api/api-spec";

const usePatchClientInvoiceServiceMonthMutation = (invoiceId: string) => {
  const api = useApi();

  return useMutation<
    IdResponse,
    AxiosError<ErrorResponseData>,
    ModifyPeriodMonthRequestDto
  >({
    mutationFn: (reqData) => {
      return api.invoices
        .modifyPeriodMonthHttpControllerPost(invoiceId, reqData)
        .then(({ data: resData }) => resData);
    },
  });
};

export default usePatchClientInvoiceServiceMonthMutation;
