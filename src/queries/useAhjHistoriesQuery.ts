import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { AhjNoteHistoryPaginatedResponseDto } from "@/api";

export const QUERY_KEY = "ahjHistories";

const useAhjHistoriesQuery = (geoId: string) => {
  const api = useApi();

  return useQuery<
    AhjNoteHistoryPaginatedResponseDto,
    AxiosError<ErrorResponseData>
  >({
    queryKey: [QUERY_KEY, geoId],
    queryFn: () =>
      api.geography
        .geographyControllerGetFindNoteUpdateHistory({
          page: 1,
          geoId,
        })
        .then(({ data }) => data),
  });
};

export default useAhjHistoriesQuery;
