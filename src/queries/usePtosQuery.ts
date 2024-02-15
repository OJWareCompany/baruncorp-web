import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import {
  FindPtoPaginatedHttpControllerGetParams,
  PtoPaginatedResponseDto,
} from "@/api/api-spec";

export const getPtosQueryKey = (
  params: FindPtoPaginatedHttpControllerGetParams
) => ["ptos", "list", params];

const usePtosQuery = ({
  params,
  enabled,
  isKeepPreviousData,
}: {
  params: FindPtoPaginatedHttpControllerGetParams;
  enabled?: boolean;
  isKeepPreviousData?: boolean;
}) => {
  const api = useApi();

  return useQuery<PtoPaginatedResponseDto, AxiosError<ErrorResponseData>>({
    queryKey: getPtosQueryKey(params),
    queryFn: () =>
      api.ptos
        .findPtoPaginatedHttpControllerGet(params)
        .then(({ data }) => data),
    enabled,
    placeholderData: isKeepPreviousData ? keepPreviousData : undefined,
  });
};

export default usePtosQuery;
