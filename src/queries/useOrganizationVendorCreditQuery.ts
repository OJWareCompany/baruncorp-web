import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { VendorCreditOrganizationTransactionResponseDto } from "@/api/api-spec";

export const getOrganizationVendorCreditQueryKey = (organizationId: string) => [
  "organization-vendor-credit",
  "detail",
  organizationId,
];

const useOrganizationVendorCreditQuery = (organizationId: string) => {
  const api = useApi();

  return useQuery<
    VendorCreditOrganizationTransactionResponseDto,
    AxiosError<ErrorResponseData>
  >({
    queryKey: getOrganizationVendorCreditQueryKey(organizationId),
    queryFn: () =>
      api.vendorCreditTransactions
        .findVendorOrganizationCreditTransactionHttpControllerGet(
          organizationId
        )
        .then(({ data }) => data),
    enabled: organizationId !== "",
  });
};

export default useOrganizationVendorCreditQuery;
