import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import {
  FindVendorInvoiceLineItemHttpControllerGetParams,
  VendorInvoiceLineItemPaginatedResponseDto,
} from "@/api/api-spec";

export const getVendorInvoiceLineItemsQueryKey = (
  params: FindVendorInvoiceLineItemHttpControllerGetParams
) => ["vendor-invoice-line-items", "list", params];

const useVendorInvoiceLineItemsQuery = (
  params: FindVendorInvoiceLineItemHttpControllerGetParams,
  isKeepPreviousData?: boolean
) => {
  const api = useApi();

  return useQuery<
    VendorInvoiceLineItemPaginatedResponseDto,
    AxiosError<ErrorResponseData>
  >({
    queryKey: getVendorInvoiceLineItemsQueryKey(params),
    queryFn: () =>
      api.vendorInvoices
        .findVendorInvoiceLineItemHttpControllerGet(params)
        .then(({ data }) => data),
    placeholderData: isKeepPreviousData ? keepPreviousData : undefined,
  });
};

export default useVendorInvoiceLineItemsQuery;
