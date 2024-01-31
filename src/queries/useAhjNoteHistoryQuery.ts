import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import {
  AhjNoteHistoryResponseDto,
  GeographyControllerGetFinNoteUpdateHistoryDetailParams,
} from "@/api/api-spec";

export const getAhjNoteHistoryQueryKey = (
  params: GeographyControllerGetFinNoteUpdateHistoryDetailParams
) => ["ahj-note-histories", "detail", params];

const useAhjNoteHistoryQuery = (
  params: GeographyControllerGetFinNoteUpdateHistoryDetailParams
) => {
  const api = useApi();

  return useQuery<AhjNoteHistoryResponseDto, AxiosError<ErrorResponseData>>({
    queryKey: getAhjNoteHistoryQueryKey(params),
    queryFn: () =>
      api.geography
        .geographyControllerGetFinNoteUpdateHistoryDetail(params)
        .then(({ data }) => data),
    enabled: params.updatedAt !== "",
  });
};

export default useAhjNoteHistoryQuery;
