import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import {
  FindPtoDetailPaginatedHttpControllerGetParams,
  PtoDetailPaginatedResponseDto,
} from "@/api/api-spec";

export const getPtoDetailsQueryKey = (
  params: FindPtoDetailPaginatedHttpControllerGetParams
) => ["pto-details", "list", params];

const usePtoDetailsQuery = (
  params: FindPtoDetailPaginatedHttpControllerGetParams,
  keepPreviousData?: boolean
) => {
  const api = useApi();

  return useQuery<PtoDetailPaginatedResponseDto, AxiosError<ErrorResponseData>>(
    {
      queryKey: getPtoDetailsQueryKey(params),
      queryFn: () =>
        api.ptos
          .findPtoDetailPaginatedHttpControllerGet(params)
          .then(({ data }) => data),
      keepPreviousData,
    }
  );
};

export default usePtoDetailsQuery;
