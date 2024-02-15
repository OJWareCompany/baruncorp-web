import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import {
  FindUtilityPaginatedHttpControllerGetParams,
  UtilityPaginatedResponseDto,
} from "@/api/api-spec";

export const getUtilitiesQueryKey = (
  params: FindUtilityPaginatedHttpControllerGetParams
) => ["utilities", "list", params];

const useUtilitiesQuery = (
  params: FindUtilityPaginatedHttpControllerGetParams,
  keepPreviousData?: boolean
) => {
  const api = useApi();

  return useQuery<UtilityPaginatedResponseDto, AxiosError<ErrorResponseData>>({
    queryKey: getUtilitiesQueryKey(params),
    queryFn: () =>
      api.utilities
        .findUtilityPaginatedHttpControllerGet(params)
        .then(({ data }) => data),
    keepPreviousData,
  });
};

export default useUtilitiesQuery;
