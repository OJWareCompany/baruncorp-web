import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { CreateVendorInvoiceRequestDto, IdResponse } from "@/api/api-spec";

const usePostVendorInvoiceMutation = () => {
  const api = useApi();

  return useMutation<
    IdResponse,
    AxiosError<ErrorResponseData>,
    CreateVendorInvoiceRequestDto
  >((reqData) =>
    api.vendorInvoices
      .createVendorInvoiceHttpControllerPost(reqData)
      .then(({ data: resData }) => resData)
  );
};

export default usePostVendorInvoiceMutation;
