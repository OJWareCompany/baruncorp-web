import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import {
  FindVendorInvoicePaginatedHttpControllerGetParams,
  VendorInvoicePaginatedResponseDto,
} from "@/api";

export const getVendorInvoicesQueryKey = (
  params: FindVendorInvoicePaginatedHttpControllerGetParams
) => ["vendor-invoices", "list", params];

const useVendorInvoicesQuery = (
  params: FindVendorInvoicePaginatedHttpControllerGetParams,
  keepPreviousData?: boolean
) => {
  const api = useApi();

  return useQuery<
    VendorInvoicePaginatedResponseDto,
    AxiosError<ErrorResponseData>
  >({
    queryKey: getVendorInvoicesQueryKey(params),
    queryFn: () =>
      api.vendorInvoices
        .findVendorInvoicePaginatedHttpControllerGet(params)
        .then(({ data }) => data),
    keepPreviousData,
  });
};

export default useVendorInvoicesQuery;
