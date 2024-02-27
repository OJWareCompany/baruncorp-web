import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { ClientToInvoiceResponseDto } from "@/api/api-spec";

export const getClientsToInvoiceQueryKey = () => ["clients-to-invoice", "list"];

const useClientsToInvoiceQuery = () => {
  const api = useApi();

  return useQuery<ClientToInvoiceResponseDto, AxiosError<ErrorResponseData>>({
    queryKey: getClientsToInvoiceQueryKey(),
    queryFn: () =>
      api.invoicesClients
        .findClientToInvoiceHttpControllerGet()
        .then(({ data }) => data),
  });
};

export default useClientsToInvoiceQuery;
