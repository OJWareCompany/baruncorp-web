import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { AhjNoteHistoryResponseDto } from "@/api";

export const QUERY_KEY = "ahjHistories";

const useAhjHistoryQuery = (historyId: string | undefined) => {
  const api = useApi();

  return useQuery<AhjNoteHistoryResponseDto, AxiosError<ErrorResponseData>>({
    queryKey: [QUERY_KEY, historyId],
    queryFn: () =>
      api.geography
        .geographyControllerGetFinNoteUpdateHistoryDetail(Number(historyId))
        .then(({ data }) => data),
    enabled: historyId != null,
  });
};

export default useAhjHistoryQuery;
