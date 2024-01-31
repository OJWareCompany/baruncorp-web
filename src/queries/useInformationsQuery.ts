import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import {
  FindInformationPaginatedHttpControllerGetParams,
  InformationPaginatedResponseDto,
} from "@/api/api-spec";

export const getInformationsQueryKey = (
  params: FindInformationPaginatedHttpControllerGetParams
) => ["informations", "list", params];

const useInformationsQuery = (
  params: FindInformationPaginatedHttpControllerGetParams
) => {
  const api = useApi();

  return useQuery<
    InformationPaginatedResponseDto,
    AxiosError<ErrorResponseData>
  >({
    queryKey: getInformationsQueryKey(params),
    queryFn: () =>
      api.informations
        .findInformationPaginatedHttpControllerGet(params)
        .then(({ data }) => data),
  });
};

export default useInformationsQuery;
