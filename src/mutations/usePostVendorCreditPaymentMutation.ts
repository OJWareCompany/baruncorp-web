import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import {
  CreateVendorCreditTransactionRequestDto,
  IdResponse,
} from "@/api/api-spec";

const usePostVendorCreditPaymentMutation = () => {
  const api = useApi();

  return useMutation<
    IdResponse,
    AxiosError<ErrorResponseData>,
    CreateVendorCreditTransactionRequestDto
  >({
    mutationFn: (reqData) => {
      return api.vendorCreditTransactions
        .createVendorCreditTransactionHttpControllerPost(reqData)
        .then(({ data: resData }) => resData);
    },
  });
};

export default usePostVendorCreditPaymentMutation;
