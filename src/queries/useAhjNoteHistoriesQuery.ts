import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import {
  AhjNoteHistoryPaginatedResponseDto,
  GeographyControllerGetFindNoteUpdateHistoryParams,
} from "@/api/api-spec";

export const getAhjNoteHistoriesQueryKey = (
  params: GeographyControllerGetFindNoteUpdateHistoryParams
) => ["ahj-note-histories", "list", params];

const useAhjNoteHistoriesQuery = (
  params: GeographyControllerGetFindNoteUpdateHistoryParams,
  isKeepPreviousData?: boolean
) => {
  const api = useApi();

  return useQuery<
    AhjNoteHistoryPaginatedResponseDto,
    AxiosError<ErrorResponseData>
  >({
    queryKey: getAhjNoteHistoriesQueryKey(params),
    queryFn: () =>
      api.geography
        .geographyControllerGetFindNoteUpdateHistory(params)
        .then(({ data }) => data),
    placeholderData: isKeepPreviousData ? keepPreviousData : undefined,
  });
};

export default useAhjNoteHistoriesQuery;
