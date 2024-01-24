import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import {
  ClientNotePaginatedResponseDto,
  FindClientNotePaginatedHttpControllerGetParams,
} from "@/api";

export const getClientNotesQueryKey = (
  params: FindClientNotePaginatedHttpControllerGetParams
) => ["client-notes", "list", params];

const useClientNotesQuery = (
  params: FindClientNotePaginatedHttpControllerGetParams,
  keepPreviousData?: boolean
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
    keepPreviousData,
  });
};

export default useClientNotesQuery;
