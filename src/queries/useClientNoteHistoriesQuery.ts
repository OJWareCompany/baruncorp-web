import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import {
  ClientNotePaginatedResponseDto,
  FindClientNotePaginatedHttpControllerGetParams,
} from "@/api/api-spec";

export const getClientNoteHistoriesQueryKey = (
  params: FindClientNotePaginatedHttpControllerGetParams
) => ["client-note-histories", "list", params];

const useClientNoteHistoriesQuery = (
  params: FindClientNotePaginatedHttpControllerGetParams,
  isKeepPreviousData?: boolean
) => {
  const api = useApi();

  return useQuery<
    ClientNotePaginatedResponseDto,
    AxiosError<ErrorResponseData>
  >({
    queryKey: getClientNoteHistoriesQueryKey(params),
    queryFn: () =>
      api.clientNote
        .findClientNotePaginatedHttpControllerGet(params)
        .then(({ data }) => data),
    enabled: params.organizationId != null && params.organizationId !== "",
    placeholderData: isKeepPreviousData ? keepPreviousData : undefined,
  });
};

export default useClientNoteHistoriesQuery;
