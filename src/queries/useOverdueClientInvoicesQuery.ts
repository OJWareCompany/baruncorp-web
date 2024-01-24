import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import {
  FindOverdueInvoicePaginatedHttpControllerGetParams,
  InvoicePaginatedResponseDto,
} from "@/api";

export const getOverdueClientInvoicesQueryKey = (
  params: FindOverdueInvoicePaginatedHttpControllerGetParams
) => ["overdue-client-invoices", "list", params];

const useOverdueClientInvoicesQuery = (
  params: FindOverdueInvoicePaginatedHttpControllerGetParams,
  keepPreviousData?: boolean
) => {
  const api = useApi();

  return useQuery<InvoicePaginatedResponseDto, AxiosError<ErrorResponseData>>({
    queryKey: getOverdueClientInvoicesQueryKey(params),
    queryFn: () =>
      api.overdueInvoices
        .findOverdueInvoicePaginatedHttpControllerGet(params)
        .then(({ data }) => data),
    keepPreviousData,
  });
};

export default useOverdueClientInvoicesQuery;
