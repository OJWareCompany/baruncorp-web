import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { QUERY_KEY as ahjQueryKey } from "./useAhjQuery";
import { QUERY_KEY as ahjHistoriesQueryKey } from "./useAhjHistoriesQuery";
import useApi from "@/hook/useApi";
import { AhjPutReqDto } from "@/types/dto/ahjs";

export const usePutAhjMutation = (geoId: string) => {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError<ErrorResponseData>, AhjPutReqDto>(
    (data) => {
      return api
        .put<void>(`/geography/${geoId}/notes`, data)
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
