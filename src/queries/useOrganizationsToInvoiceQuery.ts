import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { ClientToInvoiceResponseDto } from "@/api";

const useOrganizationsToInvoiceQuery = () => {
  const api = useApi();

  return useQuery<ClientToInvoiceResponseDto, AxiosError<ErrorResponseData>>({
    queryKey: ["organizations-to-invoice", "list"],
    queryFn: () =>
      api.invoicesClients
        .findClientToInvoiceHttpControllerGet()
        .then(({ data }) => data),
  });
};

export default useOrganizationsToInvoiceQuery;
