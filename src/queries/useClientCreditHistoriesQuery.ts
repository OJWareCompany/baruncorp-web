import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import {
  FindCreditTransactionPaginatedHttpControllerGetParams,
  CreditTransactionPaginatedResponseDto,
} from "@/api/api-spec";

export const getClientCreditHistoriesQueryKey = (
  params: FindCreditTransactionPaginatedHttpControllerGetParams
) => ["client-credit-histories", "list", params];

const useClientCreditHistoriesQuery = (
  params: FindCreditTransactionPaginatedHttpControllerGetParams,
  isKeepPreviousData?: boolean
) => {
  const api = useApi();

  return useQuery<
    CreditTransactionPaginatedResponseDto,
    AxiosError<ErrorResponseData>
  >({
    queryKey: getClientCreditHistoriesQueryKey(params),
    queryFn: () =>
      api.creditTransactions
        .findCreditTransactionPaginatedHttpControllerGet(params)
        .then(({ data }) => data),
    placeholderData: isKeepPreviousData ? keepPreviousData : undefined,
  });
};

export default useClientCreditHistoriesQuery;
