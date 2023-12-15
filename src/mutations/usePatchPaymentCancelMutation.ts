import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";

const usePatchPaymentCancelMutation = (paymentId: string) => {
  const api = useApi();

  return useMutation<void, AxiosError<ErrorResponseData>>(() => {
    return api.payments
      .cancelPaymentHttpControllerPatch(paymentId)
      .then(({ data: resData }) => resData);
  });
};

export default usePatchPaymentCancelMutation;
