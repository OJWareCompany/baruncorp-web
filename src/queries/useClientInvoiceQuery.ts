import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { InvoiceResponseDto } from "@/api";

export const getClientInvoiceQueryKey = (invoiceId: string) => [
  "client-invoices",
  "detail",
  invoiceId,
];

const useClientInvoiceQuery = (invoiceId: string) => {
  const api = useApi();

  return useQuery<InvoiceResponseDto, AxiosError<ErrorResponseData>>({
    queryKey: getClientInvoiceQueryKey(invoiceId),
    queryFn: () =>
      api.invoices
        .findInvoiceHttpControllerGet(invoiceId)
        .then(({ data }) => data),
    enabled: invoiceId !== "",
  });
};

export default useClientInvoiceQuery;
