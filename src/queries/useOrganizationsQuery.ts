import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import {
  FindOrganizationPaginatedHttpControllerGetOrganizationPaginatedParams,
  OrganizationPaginatedResponseDto,
} from "@/api";

export const getOrganizationsQueryKey = (
  params: FindOrganizationPaginatedHttpControllerGetOrganizationPaginatedParams
) => ["organizations", "list", params];

const useOrganizationsQuery = (
  params: FindOrganizationPaginatedHttpControllerGetOrganizationPaginatedParams
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
    keepPreviousData: true,
  });
};

export default useOrganizationsQuery;
