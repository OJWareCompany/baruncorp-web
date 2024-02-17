import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { UtilityHistoryDetailResponseDto } from "@/api/api-spec";

export const getUtilityNoteHistoryQueryKey = (utilityHistoryId: string) => [
  "utility-note-histories",
  "detail",
  utilityHistoryId,
];

const useUtilityNoteHistoryQuery = (utilityHistoryId: string) => {
  const api = useApi();

  return useQuery<
    UtilityHistoryDetailResponseDto,
    AxiosError<ErrorResponseData>
  >({
    queryKey: getUtilityNoteHistoryQueryKey(utilityHistoryId),
    queryFn: () =>
      api.utilities
        .findUtilityHistoryHttpControllerGet(utilityHistoryId)
        .then(({ data }) => data),
  });
};

export default useUtilityNoteHistoryQuery;
