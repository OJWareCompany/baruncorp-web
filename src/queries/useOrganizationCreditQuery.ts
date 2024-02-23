import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { CreditOrganizationTransactionResponseDto } from "@/api/api-spec";

export const getOrganizationCreditQueryKey = (organizationId: string) => [
  "organization-credit",
  "detail",
  organizationId,
];

const useOrganizationCreditQuery = (organizationId: string) => {
  const api = useApi();

  return useQuery<
    CreditOrganizationTransactionResponseDto,
    AxiosError<ErrorResponseData>
  >({
    queryKey: getOrganizationCreditQueryKey(organizationId),
    queryFn: () =>
      api.creditTransactions
        .findOrganizationCreditTransactionHttpControllerGet(organizationId)
        .then(({ data }) => data),
    enabled: organizationId !== "",
  });
};

export default useOrganizationCreditQuery;
