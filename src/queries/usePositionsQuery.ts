import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import {
  FindPositionPaginatedHttpControllerGetParams,
  PositionPaginatedResponseDto,
} from "@/api/api-spec";

export const getPositionsQueryKey = (
  params: FindPositionPaginatedHttpControllerGetParams
) => ["positions", "list", params];

const usePositionsQuery = (
  params: FindPositionPaginatedHttpControllerGetParams,
  isKeepPreviousData?: boolean
) => {
  const api = useApi();

  return useQuery<PositionPaginatedResponseDto, AxiosError<ErrorResponseData>>({
    queryKey: getPositionsQueryKey(params),
    queryFn: () =>
      api.positions
        .findPositionPaginatedHttpControllerGet(params)
        .then(({ data }) => data),
    placeholderData: isKeepPreviousData ? keepPreviousData : undefined,
  });
};

export default usePositionsQuery;
