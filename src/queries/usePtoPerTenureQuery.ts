import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import {
  FindPtoTenurePolicyPaginatedHttpControllerGetParams,
  PtoTenurePolicyPaginatedResponseDto,
} from "@/api/api-spec";

export const getPtoPerTenureQueryKey = (
  params: FindPtoTenurePolicyPaginatedHttpControllerGetParams
) => ["pto-per-tenure", "list", params];

const usePtoPerTenureQuery = (
  params: FindPtoTenurePolicyPaginatedHttpControllerGetParams
) => {
  const api = useApi();

  return useQuery<
    PtoTenurePolicyPaginatedResponseDto,
    AxiosError<ErrorResponseData>
  >({
    queryKey: getPtoPerTenureQueryKey(params),
    queryFn: () =>
      api.ptoTenurePolicies
        .findPtoTenurePolicyPaginatedHttpControllerGet(params)
        .then(({ data }) => data),
  });
};

export default usePtoPerTenureQuery;
