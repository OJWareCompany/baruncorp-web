import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";

const usePatchClientCreditPaymentCancelMutation = () => {
  const api = useApi();

  return useMutation<
    void,
    AxiosError<ErrorResponseData>,
    {
      creditTransactionId: string;
    }
  >({
    mutationFn: (reqData) => {
      return api.creditTransactions
        .cancelCreditTransactionHttpControllerPatch(reqData.creditTransactionId)
        .then(({ data: resData }) => resData);
    },
  });
};

export default usePatchClientCreditPaymentCancelMutation;
