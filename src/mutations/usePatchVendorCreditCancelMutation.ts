import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";

const usePatchVendorCreditCancelMutation = () => {
  const api = useApi();

  return useMutation<
    void,
    AxiosError<ErrorResponseData>,
    {
      vendorCreditTransactionId: string;
    }
  >({
    mutationFn: (reqData) => {
      return api.vendorCreditTransactions
        .cancelVendorCreditTransactionHttpControllerPatch(
          reqData.vendorCreditTransactionId
        )
        .then(({ data: resData }) => resData);
    },
  });
};

export default usePatchVendorCreditCancelMutation;
