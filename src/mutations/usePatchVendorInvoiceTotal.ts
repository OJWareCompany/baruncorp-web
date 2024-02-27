import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { UpdateVendorInvoicedTotalRequestDto } from "@/api/api-spec";

const usePatchVendorInvoiceTotal = (vendorInvoiceId: string) => {
  const api = useApi();

  return useMutation<
    void,
    AxiosError<ErrorResponseData>,
    UpdateVendorInvoicedTotalRequestDto
  >({
    mutationFn: (reqData) => {
      return api.vendorInvoices
        .updateVendorInvoicedTotalHttpControllerPatch(vendorInvoiceId, reqData)
        .then(({ data: resData }) => resData);
    },
  });
};

export default usePatchVendorInvoiceTotal;
