import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import {
  FindUtilityPaginatedHttpControllerGetParams,
  UtilityPaginatedResponseDto,
} from "@/api/api-spec";

export const getUtilitiesQueryKey = (
  params: FindUtilityPaginatedHttpControllerGetParams
) => ["utilities", "list", params];

const useUtilitiesQuery = ({
  params,
  enabled,
  isKeepPreviousData,
}: {
  params: FindUtilityPaginatedHttpControllerGetParams;
  isKeepPreviousData?: boolean;
  enabled?: boolean;
}) => {
  const api = useApi();

  return useQuery<UtilityPaginatedResponseDto, AxiosError<ErrorResponseData>>({
    queryKey: getUtilitiesQueryKey(params),
    queryFn: () =>
      api.utilities
        .findUtilityPaginatedHttpControllerGet(params)
        .then(({ data }) => data),
    placeholderData: isKeepPreviousData ? keepPreviousData : undefined,
    enabled,
  });
};

export default useUtilitiesQuery;
