import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import {
  FindOrganizationPaginatedHttpControllerGetOrganizationPaginatedParams,
  OrganizationPaginatedResponseDto,
} from "@/api/api-spec";

export const getOrganizationsQueryKey = (
  params: FindOrganizationPaginatedHttpControllerGetOrganizationPaginatedParams
) => ["organizations", "list", params];

const useOrganizationsQuery = (
  params: FindOrganizationPaginatedHttpControllerGetOrganizationPaginatedParams,
  isKeepPreviousData?: boolean
) => {
  const api = useApi();

  return useQuery<
    OrganizationPaginatedResponseDto,
    AxiosError<ErrorResponseData>
  >({
    queryKey: getOrganizationsQueryKey(params),
    queryFn: () =>
      api.organizations
        .findOrganizationPaginatedHttpControllerGetOrganizationPaginated(params)
        .then(({ data }) => data),
    placeholderData: isKeepPreviousData ? keepPreviousData : undefined,
  });
};

export default useOrganizationsQuery;
