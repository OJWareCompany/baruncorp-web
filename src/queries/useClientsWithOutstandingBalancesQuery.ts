import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import {
  FindClientWithOutstandingBalancesHttpControllerGetParams,
  ClientWithOutstandingBalancesPaginatedResponseDto,
} from "@/api/api-spec";

export const getClientsWithOutstandingBalancesQueryKey = (
  params: FindClientWithOutstandingBalancesHttpControllerGetParams
) => ["clients-with-outstanding-balances", "list", params];

const useClientsWithOutstandingBalancesQuery = (
  params: FindClientWithOutstandingBalancesHttpControllerGetParams,
  keepPreviousData?: boolean
) => {
  const api = useApi();

  return useQuery<
    ClientWithOutstandingBalancesPaginatedResponseDto,
    AxiosError<ErrorResponseData>
  >({
    queryKey: getClientsWithOutstandingBalancesQueryKey(params),
    queryFn: () =>
      api.clientWithOutstandingBalances
        .findClientWithOutstandingBalancesHttpControllerGet(params)
        .then(({ data }) => data),
    keepPreviousData,
  });
};

export default useClientsWithOutstandingBalancesQuery;
