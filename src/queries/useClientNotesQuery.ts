import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import {
  ClientNotePaginatedResponseDto,
  FindClientNotePaginatedHttpControllerGetParams,
} from "@/api/api-spec";

export const getClientNotesQueryKey = (
  params: FindClientNotePaginatedHttpControllerGetParams
) => ["client-notes", "list", params];

const useClientNotesQuery = (
  params: FindClientNotePaginatedHttpControllerGetParams,
  isKeepPreviousData?: boolean
) => {
  const api = useApi();

  return useQuery<
    ClientNotePaginatedResponseDto,
    AxiosError<ErrorResponseData>
  >({
    queryKey: getClientNotesQueryKey(params),
    queryFn: () =>
      api.clientNote
        .findClientNotePaginatedHttpControllerGet(params)
        .then(({ data }) => data),
    enabled: params.organizationId != null && params.organizationId !== "",
    placeholderData: isKeepPreviousData ? keepPreviousData : undefined,
  });
};

export default useClientNotesQuery;
