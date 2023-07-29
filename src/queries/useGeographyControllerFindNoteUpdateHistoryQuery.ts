import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { AhjNoteHistoryPaginatedResponseDto } from "@/api";

export const QUERY_KEY = "geographyControllerFindNoteUpdateHistory";

const useGeographyControllerFindNoteUpdateHistoryQuery = (geoId: string) => {
  const api = useApi();

  return useQuery<
    AhjNoteHistoryPaginatedResponseDto,
    AxiosError<ErrorResponseData>
  >({
    queryKey: [QUERY_KEY, geoId],
    queryFn: () =>
      api.geography
        .geographyControllerFindNoteUpdateHistory({
          page: 1,
          geoId,
        }) // TODO: pagination 적용
        .then(({ data }) => data),
  });
};

export default useGeographyControllerFindNoteUpdateHistoryQuery;
