import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { CreateVendorPaymentRequestDto, IdResponse } from "@/api/api-spec";

const usePostVendorDirectPaymentMutation = () => {
  const api = useApi();

  return useMutation<
    IdResponse,
    AxiosError<ErrorResponseData>,
    CreateVendorPaymentRequestDto
  >({
    mutationFn: (reqData) => {
      return api.vendorPayments
        .createVendorPaymentHttpControllerPost(reqData)
        .then(({ data: resData }) => resData);
    },
  });
};

export default usePostVendorDirectPaymentMutation;
