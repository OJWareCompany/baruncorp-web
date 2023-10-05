import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import {
  CreatePaymentRequestDto,
  IdResponse,
} from "@/api";

const usePostPaymentMutation = () => {
  const api = useApi();

  return useMutation<
    IdResponse,
    AxiosError<ErrorResponseData>,
    CreatePaymentRequestDto
  >((reqData) =>
    api.payments
      .createPaymentHttpControllerPost(reqData)
      .then(({ data: resData }) => resData)
  );
};

export default usePostPaymentMutation;
