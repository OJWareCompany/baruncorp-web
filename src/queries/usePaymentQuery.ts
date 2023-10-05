import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { PaymentResponseDto } from "@/api";

const usePaymentQuery = ({ paymentId }: { paymentId: string }) => {
  const api = useApi();

  return useQuery<PaymentResponseDto, AxiosError<ErrorResponseData>>({
    queryKey: ["payments", "detail", { paymentId }],
    queryFn: () =>
      api.payments
        .findPaymentHttpControllerGet(paymentId)
        .then(({ data }) => data),
    enabled: paymentId !== "",
  });
};

export default usePaymentQuery;
