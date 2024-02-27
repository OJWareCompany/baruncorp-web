import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";

const usePatchVendorCreditPaymentCancelMutation = () => {
  const api = useApi();

  return useMutation<
    void,
    AxiosError<ErrorResponseData>,
    {
      creditTransactionId: string;
    }
  >({
    mutationFn: (reqData) => {
      return api.vendorCreditTransactions
        .cancelVendorCreditTransactionHttpControllerPatch(
          reqData.creditTransactionId
        )
        .then(({ data: resData }) => resData);
    },
  });
};

export default usePatchVendorCreditPaymentCancelMutation;
