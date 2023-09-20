import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { AhjNoteHistoryResponseDto } from "@/api";

const useAhjNoteHistoryQuery = (historyId: string | undefined) => {
  const api = useApi();

  return useQuery<AhjNoteHistoryResponseDto, AxiosError<ErrorResponseData>>({
    queryKey: ["ahjNoteHistories", "detail", historyId],
    queryFn: () =>
      api.geography
        .geographyControllerGetFinNoteUpdateHistoryDetail(Number(historyId))
        .then(({ data }) => data),
    enabled: historyId !== undefined && historyId !== "",
  });
};

export default useAhjNoteHistoryQuery;
