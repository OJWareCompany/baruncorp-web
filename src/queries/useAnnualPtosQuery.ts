import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import {
  FindPtoAnnualPaginatedHttpControllerGetParams,
  PtoAnnualPaginatedResponseDto,
} from "@/api/api-spec";

export const getAnnualPtosQueryKey = (
  params: FindPtoAnnualPaginatedHttpControllerGetParams
) => ["annual-ptos", "list", params];

const useAnnualPtosQuery = (
  params: FindPtoAnnualPaginatedHttpControllerGetParams,
  keepPreviousData?: boolean
) => {
  const api = useApi();

  return useQuery<PtoAnnualPaginatedResponseDto, AxiosError<ErrorResponseData>>(
    {
      queryKey: getAnnualPtosQueryKey(params),
      queryFn: () =>
        api.ptos
          .findPtoAnnualPaginatedHttpControllerGet(params)
          .then(({ data }) => data),
      keepPreviousData,
    }
  );
};

export default useAnnualPtosQuery;
