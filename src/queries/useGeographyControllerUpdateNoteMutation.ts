import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { QUERY_KEY as ahjQueryKey } from "./useGeographyControllerFindNoteByGeoIdQuery";
import { QUERY_KEY as ahjHistoriesQueryKey } from "./useGeographyControllerFindNoteUpdateHistoryQuery";
import useApi from "@/hook/useApi";
import { UpdateAhjNoteRequestDto } from "@/api";

const useGeographyControllerUpdateNoteMutation = (geoId: string) => {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation<
    void,
    AxiosError<ErrorResponseData>,
    UpdateAhjNoteRequestDto
  >(
    (data) => {
      return api.geography
        .geographyControllerUpdateNote(geoId, data)
        .then(({ data }) => data);
    },
    {
      onSuccess: async () => {
        queryClient.invalidateQueries({
          queryKey: [ahjQueryKey, geoId],
        });
        queryClient.invalidateQueries({
          queryKey: [ahjHistoriesQueryKey, geoId],
        });
      },
    }
  );
};

export default useGeographyControllerUpdateNoteMutation;
