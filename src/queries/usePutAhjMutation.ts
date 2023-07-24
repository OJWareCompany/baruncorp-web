import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { QUERY_KEY as ahjQueryKey } from "./useAhjQuery";
import useApiClient from "@/hook/useApiClient";
import { AhjPutReqDto } from "@/types/dto/ahjs";

export const usePutAhjMutation = (geoId: string) => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError<ErrorResponseData>, AhjPutReqDto>(
    (data) => {
      return apiClient
        .put<void>(`/geography/${geoId}/notes`, data)
        .then(({ data }) => data);
    },
    {
      onSuccess: async () => {
        queryClient.invalidateQueries({
          queryKey: [ahjQueryKey, geoId],
        });
      },
    }
  );
};
