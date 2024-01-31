import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import {
  FindPtoTypePaginatedHttpControllerGetParams,
  PtoTypePaginatedResponseDto,
} from "@/api/api-spec";

export const getPtoTypesQueryKey = (
  params: FindPtoTypePaginatedHttpControllerGetParams
) => ["pto-types", "list", params];

const usePtoTypesQuery = (
  params: FindPtoTypePaginatedHttpControllerGetParams
) => {
  const api = useApi();

  return useQuery<PtoTypePaginatedResponseDto, AxiosError<ErrorResponseData>>({
    queryKey: getPtoTypesQueryKey(params),
    queryFn: () =>
      api.ptos
        .findPtoTypePaginatedHttpControllerGet(params)
        .then(({ data }) => data),
  });
};

export default usePtoTypesQuery;
