import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";

const usePatchPaymentDirectCancelMutation = () => {
  const api = useApi();

  return useMutation<
    void,
    AxiosError<ErrorResponseData>,
    {
      paymentId: string;
    }
  >({
    mutationFn: (reqData) => {
      return api.payments
        .cancelPaymentHttpControllerPatch(reqData.paymentId)
        .then(({ data: resData }) => resData);
    },
  });
};

export default usePatchPaymentDirectCancelMutation;
