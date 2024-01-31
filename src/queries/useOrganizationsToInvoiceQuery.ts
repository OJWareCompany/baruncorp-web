import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { ClientToInvoiceResponseDto } from "@/api/api-spec";

export const getOrganizationsToInvoiceQueryKey = () => [
  "organizations-to-invoice",
  "list",
];

const useOrganizationsToInvoiceQuery = () => {
  const api = useApi();

  return useQuery<ClientToInvoiceResponseDto, AxiosError<ErrorResponseData>>({
    queryKey: getOrganizationsToInvoiceQueryKey(),
    queryFn: () =>
      api.invoicesClients
        .findClientToInvoiceHttpControllerGet()
        .then(({ data }) => data),
  });
};

export default useOrganizationsToInvoiceQuery;
