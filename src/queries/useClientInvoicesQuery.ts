import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import {
  FindInvoicePaginatedHttpControllerGetParams,
  InvoicePaginatedResponseDto,
} from "@/api";

export const getClientInvoicesQueryKey = (
  params: FindInvoicePaginatedHttpControllerGetParams
) => ["client-invoices", "list", params];

const useClientInvoicesQuery = (
  params: FindInvoicePaginatedHttpControllerGetParams,
  keepPreviousData?: boolean
) => {
  const api = useApi();

  return useQuery<InvoicePaginatedResponseDto, AxiosError<ErrorResponseData>>({
    queryKey: getClientInvoicesQueryKey(params),
    queryFn: () =>
      api.invoices
        .findInvoicePaginatedHttpControllerGet(params)
        .then(({ data }) => data),
    keepPreviousData,
  });
};

export default useClientInvoicesQuery;
