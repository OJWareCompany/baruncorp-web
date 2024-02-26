import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { VendorCreditOrganizationTransactionResponseDto } from "@/api/api-spec";

export const getVendorCreditQueryKey = (organizationId: string) => [
  "vendor-credit",
  "detail",
  organizationId,
];

const useVendorCreditQuery = (organizationId: string) => {
  const api = useApi();

  return useQuery<
    VendorCreditOrganizationTransactionResponseDto,
    AxiosError<ErrorResponseData>
  >({
    queryKey: getVendorCreditQueryKey(organizationId),
    queryFn: () =>
      api.vendorCreditTransactions
        .findVendorOrganizationCreditTransactionHttpControllerGet(
          organizationId
        )
        .then(({ data }) => data),
    enabled: organizationId !== "",
  });
};

export default useVendorCreditQuery;
