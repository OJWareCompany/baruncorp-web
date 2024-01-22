import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import {
  FindPtoPaginatedHttpControllerGetParams,
  PtoPaginatedResponseDto,
} from "@/api";

export const getPtosQueryKey = (
  params: FindPtoPaginatedHttpControllerGetParams
) => ["ptos", "list", params];

const usePtosQuery = ({
  params,
  enabled,
  keepPreviousData,
}: {
  params: FindPtoPaginatedHttpControllerGetParams;
  enabled?: boolean;
  keepPreviousData?: boolean;
}) => {
  const api = useApi();

  return useQuery<PtoPaginatedResponseDto, AxiosError<ErrorResponseData>>({
    queryKey: getPtosQueryKey(params),
    queryFn: () =>
      api.ptos
        .findPtoPaginatedHttpControllerGet(params)
        .then(({ data }) => data),
    enabled,
    keepPreviousData,
  });
};

export default usePtosQuery;
