import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import {
  UtilityHistoryPaginatedResponseDto,
  FindUtilityHistoryPaginatedHttpControllerGetParams,
} from "@/api/api-spec";

export const getUtilityNoteHistoriesQueryKey = (
  params: FindUtilityHistoryPaginatedHttpControllerGetParams
) => ["utility-note-histories", "list", params];

const useUtilityNoteHistoriesQuery = (
  params: FindUtilityHistoryPaginatedHttpControllerGetParams,
  isKeepPreviousData?: boolean
) => {
  const api = useApi();

  return useQuery<
    UtilityHistoryPaginatedResponseDto,
    AxiosError<ErrorResponseData>
  >({
    queryKey: getUtilityNoteHistoriesQueryKey(params),
    queryFn: () =>
      api.utilities
        .findUtilityHistoryPaginatedHttpControllerGet(params)
        .then(({ data }) => data),
    placeholderData: isKeepPreviousData ? keepPreviousData : undefined,
  });
};

export default useUtilityNoteHistoriesQuery;
