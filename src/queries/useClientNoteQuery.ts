import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { ClientNoteDetailResponseDto } from "@/api/api-spec";

export const getClientNoteQueryKey = (clientNoteId: string) => [
  "client-notes",
  "detail",
  clientNoteId,
];

const useClientNoteQuery = (
  clientNoteId: string,
  keepPreviousData?: boolean
) => {
  const api = useApi();

  return useQuery<ClientNoteDetailResponseDto, AxiosError<ErrorResponseData>>({
    queryKey: getClientNoteQueryKey(clientNoteId),
    queryFn: () =>
      api.clientNote
        .findClientNoteHttpControllerGet(clientNoteId)
        .then(({ data }) => data),
    enabled: clientNoteId !== "",
    keepPreviousData,
  });
};

export default useClientNoteQuery;
