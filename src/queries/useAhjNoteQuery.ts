import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { AhjNoteResponseDto } from "@/api";

const useAhjNoteQuery = ({
  geoId,
  initialData,
}: {
  geoId: string;
  initialData?: AhjNoteResponseDto;
}) => {
  const api = useApi();

  return useQuery<AhjNoteResponseDto, AxiosError<ErrorResponseData>>({
    queryKey: ["ahjNotes", "detail", geoId],
    queryFn: () =>
      api.geography
        .geographyControllerGetFindNoteByGeoId(geoId)
        .then(({ data }) => data),
    initialData,
  });
};

export default useAhjNoteQuery;
