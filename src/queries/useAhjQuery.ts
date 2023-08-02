import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { AhjNoteResponseDto } from "@/api";

export const QUERY_KEY = "ahjs";

const useAhjQuery = (geoId: string) => {
  const api = useApi();

  return useQuery<AhjNoteResponseDto, AxiosError<ErrorResponseData>>({
    queryKey: [QUERY_KEY, geoId],
    queryFn: () =>
      api.geography
        .geographyControllerGetFindNoteByGeoId(geoId)
        .then(({ data }) => data),
  });
};

export default useAhjQuery;
