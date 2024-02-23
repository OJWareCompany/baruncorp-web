import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { VendorInvoiceResponseDto } from "@/api/api-spec";

export const getVendorInvoiceQueryKey = (invoiceId: string) => [
  "vendor-invoices",
  "detail",
  invoiceId,
];

const useVendorInvoiceQuery = (invoiceId: string) => {
  const api = useApi();

  return useQuery<VendorInvoiceResponseDto, AxiosError<ErrorResponseData>>({
    queryKey: getVendorInvoiceQueryKey(invoiceId),
    queryFn: () =>
      api.vendorInvoices
        .findVendorInvoiceHttpControllerGet(invoiceId)
        .then(({ data }) => data),
    enabled: invoiceId !== "",
  });
};

export default useVendorInvoiceQuery;
