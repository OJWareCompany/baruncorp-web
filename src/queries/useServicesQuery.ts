import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import {
  FindServicePaginatedHttpControllerGetParams,
  ServicePaginatedResponseDto,
} from "@/api/api-spec";

export const getServicesQueryKey = (
  params: FindServicePaginatedHttpControllerGetParams
) => ["services", "list", params];

const useServicesQuery = (
  params: FindServicePaginatedHttpControllerGetParams
) => {
  const api = useApi();

  return useQuery<ServicePaginatedResponseDto, AxiosError<ErrorResponseData>>({
    queryKey: getServicesQueryKey(params),
    queryFn: () =>
      api.services
        .findServicePaginatedHttpControllerGet(params)
        .then(({ data }) => data),
  });
};

export default useServicesQuery;
