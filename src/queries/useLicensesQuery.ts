import { keepPreviousData, useQuery } from "@tanstack/react-query";
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
  isKeepPreviousData?: boolean
) => {
  const api = useApi();

  return useQuery<LicensePaginatedResponseDto, AxiosError<ErrorResponseData>>({
    queryKey: getLicensesQueryKey(params),
    queryFn: () =>
      api.licenses
        .findLicensePaginatedHttpControllerGet(params)
        .then(({ data }) => data),
    placeholderData: isKeepPreviousData ? keepPreviousData : undefined,
  });
};

export default useLicensesQuery;
