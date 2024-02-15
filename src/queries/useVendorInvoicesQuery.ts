import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import {
  FindVendorInvoicePaginatedHttpControllerGetParams,
  VendorInvoicePaginatedResponseDto,
} from "@/api/api-spec";

export const getVendorInvoicesQueryKey = (
  params: FindVendorInvoicePaginatedHttpControllerGetParams
) => ["vendor-invoices", "list", params];

const useVendorInvoicesQuery = (
  params: FindVendorInvoicePaginatedHttpControllerGetParams,
  isKeepPreviousData?: boolean
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
    placeholderData: isKeepPreviousData ? keepPreviousData : undefined,
  });
};

export default useVendorInvoicesQuery;
