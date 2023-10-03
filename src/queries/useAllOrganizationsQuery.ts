import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { OrganizationPaginatedResponseDto } from "@/api";

const useAllOrganizationsQuery = () => {
  const api = useApi();

  return useQuery<
    OrganizationPaginatedResponseDto,
    AxiosError<ErrorResponseData>
  >({
    queryKey: ["organizations", "list", "all"],
    queryFn: () =>
      api.organizations
        .findOrganizationPaginatedHttpControllerGetOrganizationPaginated({
          limit: Number.MAX_SAFE_INTEGER,
        })
        .then(({ data }) => data),
  });
};

export default useAllOrganizationsQuery;
