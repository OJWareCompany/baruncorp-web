import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import {
  FindOverdueInvoicePaginatedHttpControllerGetParams,
  InvoicePaginatedResponseDto,
} from "@/api/api-spec";

export const getOverdueClientInvoicesQueryKey = (
  params: FindOverdueInvoicePaginatedHttpControllerGetParams
) => ["overdue-client-invoices", "list", params];

const useOverdueClientInvoicesQuery = (
  params: FindOverdueInvoicePaginatedHttpControllerGetParams,
  isKeepPreviousData?: boolean
) => {
  const api = useApi();

  return useQuery<InvoicePaginatedResponseDto, AxiosError<ErrorResponseData>>({
    queryKey: getOverdueClientInvoicesQueryKey(params),
    queryFn: () =>
      api.overdueInvoices
        .findOverdueInvoicePaginatedHttpControllerGet(params)
        .then(({ data }) => data),
    placeholderData: isKeepPreviousData ? keepPreviousData : undefined,
  });
};

export default useOverdueClientInvoicesQuery;
