import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { UpdateVendorInvoiceRequestDto } from "@/api/api-spec";

const usePatchVendorInvoiceMutation = (invoiceId: string) => {
  const api = useApi();

  return useMutation<
    void,
    AxiosError<ErrorResponseData>,
    UpdateVendorInvoiceRequestDto
  >({
    mutationFn: (reqData) => {
      return api.vendorInvoices
        .updateVendorInvoiceHttpControllerPatch(invoiceId, reqData)
        .then(({ data: resData }) => resData);
    },
  });
};

export default usePatchVendorInvoiceMutation;
