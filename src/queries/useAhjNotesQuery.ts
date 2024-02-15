import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import {
  AhjNotePaginatedResponseDto,
  GeographyControllerGetFindNotesParams,
} from "@/api/api-spec";

export const getAhjNotesQueryKey = (
  params: GeographyControllerGetFindNotesParams
) => ["ahj-notes", "list", params];

const useAhjNotesQuery = (
  params: GeographyControllerGetFindNotesParams,
  isKeepPreviousData?: boolean
) => {
  const api = useApi();

  return useQuery<AhjNotePaginatedResponseDto, AxiosError<ErrorResponseData>>({
    queryKey: getAhjNotesQueryKey(params),
    queryFn: () =>
      api.geography
        .geographyControllerGetFindNotes(params)
        .then(({ data }) => data),
    placeholderData: isKeepPreviousData ? keepPreviousData : undefined,
  });
};

export default useAhjNotesQuery;
