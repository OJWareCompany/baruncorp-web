import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import {
  FindLicensePaginatedHttpControllerGetParams,
  LicensePaginatedResponseDto,
} from "@/api/api-spec";

export const getLicensesQueryKey = (
  params: FindLicensePaginatedHttpControllerGetParams
) => ["licenses", "list", params];

const useLicensesQuery = (
  params: FindLicensePaginatedHttpControllerGetParams,
  keepPreviousData?: boolean
) => {
  const api = useApi();

  return useQuery<LicensePaginatedResponseDto, AxiosError<ErrorResponseData>>({
    queryKey: getLicensesQueryKey(params),
    queryFn: () =>
      api.licenses
        .findLicensePaginatedHttpControllerGet(params)
        .then(({ data }) => data),
    keepPreviousData,
  });
};

export default useLicensesQuery;
