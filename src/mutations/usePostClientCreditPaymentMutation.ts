import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { CreateCreditTransactionRequestDto, IdResponse } from "@/api/api-spec";

const usePostClientCreditPaymentMutation = () => {
  const api = useApi();

  return useMutation<
    IdResponse,
    AxiosError<ErrorResponseData>,
    CreateCreditTransactionRequestDto
  >({
    mutationFn: (reqData) => {
      return api.creditTransactions
        .createCreditTransactionHttpControllerPost(reqData)
        .then(({ data: resData }) => resData);
    },
  });
};

export default usePostClientCreditPaymentMutation;
