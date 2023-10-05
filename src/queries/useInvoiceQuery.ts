import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { InvoiceResponseDto } from "@/api";

const useInvoiceQuery = ({ invoiceId }: { invoiceId: string }) => {
  const api = useApi();

  return useQuery<InvoiceResponseDto, AxiosError<ErrorResponseData>>({
    queryKey: ["invoices", "detail", { invoiceId }],
    queryFn: () =>
      api.invoices
        .findInvoiceHttpControllerGet(invoiceId)
        .then(({ data }) => data),
    enabled: invoiceId !== "",
  });
};

export default useInvoiceQuery;
