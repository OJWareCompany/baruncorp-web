import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { CreatePaymentRequestDto, IdResponse } from "@/api/api-spec";

const usePostPaymentMutation = () => {
  const api = useApi();

  return useMutation<
    IdResponse,
    AxiosError<ErrorResponseData>,
    CreatePaymentRequestDto
  >({
    mutationFn: (reqData) => {
      return api.payments
        .createPaymentHttpControllerPost(reqData)
        .then(({ data: resData }) => resData);
    },
  });
};

export default usePostPaymentMutation;
