import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { CreateInvoiceRequestDto, IdResponse } from "@/api/api-spec";

const usePostInvoiceMutation = () => {
  const api = useApi();

  return useMutation<
    IdResponse,
    AxiosError<ErrorResponseData>,
    CreateInvoiceRequestDto
  >({
    mutationFn: (reqData) => {
      return api.invoices
        .createInvoiceHttpControllerPost(reqData)
        .then(({ data: resData }) => resData);
    },
  });
};

export default usePostInvoiceMutation;
