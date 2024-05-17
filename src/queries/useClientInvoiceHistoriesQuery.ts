import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { InvoiceResponseDto } from "@/api/api-spec";

export const getClientInvoiceHistoriesQueryKey = (invoiceId: string) => [
  "invoice-histories",
  "list",
  invoiceId,
];

const useClientInvoiceHistoriesQuery = (invoiceId: string) => {
  const api = useApi();

  return useQuery<InvoiceResponseDto, AxiosError<ErrorResponseData>>({
    queryKey: getClientInvoiceHistoriesQueryKey(invoiceId),
    queryFn: () =>
      api.invoices
        .findInvoiceHttpControllerGet(invoiceId)
        .then(({ data }) => data),
  });
};

export default useClientInvoiceHistoriesQuery;
