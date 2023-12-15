import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { AhjNoteResponseDto } from "@/api";

export const getAhjNoteQueryKey = (geoId: string) => [
  "ahj-notes",
  "detail",
  geoId,
];

const useAhjNoteQuery = (geoId: string) => {
  const api = useApi();

  return useQuery<AhjNoteResponseDto, AxiosError<ErrorResponseData>>({
    queryKey: getAhjNoteQueryKey(geoId),
    queryFn: () =>
      api.geography
        .geographyControllerGetFindNoteByGeoId(geoId)
        .then(({ data }) => data),
    enabled: geoId !== "",
  });
};

export default useAhjNoteQuery;
