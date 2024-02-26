import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import {
  FindVendorCreditTransactionPaginatedHttpControllerGetParams,
  VendorCreditTransactionPaginatedResponseDto,
} from "@/api/api-spec";

export const getVendorCreditHistoriesQueryKey = (
  params: FindVendorCreditTransactionPaginatedHttpControllerGetParams
) => ["vendor-credit-histories", "list", params];

const useVendorCreditHistoriesQuery = (
  params: FindVendorCreditTransactionPaginatedHttpControllerGetParams,
  isKeepPreviousData?: boolean
) => {
  const api = useApi();

  return useQuery<
    VendorCreditTransactionPaginatedResponseDto,
    AxiosError<ErrorResponseData>
  >({
    queryKey: getVendorCreditHistoriesQueryKey(params),
    queryFn: () =>
      api.vendorCreditTransactions
        .findVendorCreditTransactionPaginatedHttpControllerGet(params)
        .then(({ data }) => data),
    placeholderData: isKeepPreviousData ? keepPreviousData : undefined,
  });
};

export default useVendorCreditHistoriesQuery;
