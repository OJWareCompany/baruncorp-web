import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApiClient from "@/hook/useApiClient";
import { AhjHistoryGetResDto } from "@/types/dto/ahjs";

export const QUERY_KEY = "ahjHistories";

const useAhjHistoryQuery = (historyId: string | undefined) => {
  const apiClient = useApiClient();

  return useQuery<AhjHistoryGetResDto, AxiosError<ErrorResponseData>>({
    queryKey: [QUERY_KEY, historyId],
    queryFn: () =>
      apiClient
        .get<AhjHistoryGetResDto>(`/geography/notes/history/${historyId}`)
        .then(({ data }) => data),
    enabled: historyId != null,
  });
};

export default useAhjHistoryQuery;
