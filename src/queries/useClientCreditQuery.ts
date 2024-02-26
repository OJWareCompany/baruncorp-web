import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { CreditOrganizationTransactionResponseDto } from "@/api/api-spec";

export const getClientCreditQueryKey = (organizationId: string) => [
  "client-credit",
  "detail",
  organizationId,
];

const useClientCreditQuery = (organizationId: string) => {
  const api = useApi();

  return useQuery<
    CreditOrganizationTransactionResponseDto,
    AxiosError<ErrorResponseData>
  >({
    queryKey: getClientCreditQueryKey(organizationId),
    queryFn: () =>
      api.creditTransactions
        .findOrganizationCreditTransactionHttpControllerGet(organizationId)
        .then(({ data }) => data),
    enabled: organizationId !== "",
  });
};

export default useClientCreditQuery;
