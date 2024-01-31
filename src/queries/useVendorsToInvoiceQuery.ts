import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { VendorToInvoiceResponseDto } from "@/api/api-spec";

export const getVendorsToInvoiceQueryKey = () => ["vendors-to-invoice", "list"];

const useVendorsToInvoiceQuery = () => {
  const api = useApi();

  return useQuery<VendorToInvoiceResponseDto, AxiosError<ErrorResponseData>>({
    queryKey: getVendorsToInvoiceQueryKey(),
    queryFn: () =>
      api.vendorToInvoices
        .findVendorToInvoicePaginatedHttpControllerGet()
        .then(({ data }) => data),
  });
};

export default useVendorsToInvoiceQuery;
