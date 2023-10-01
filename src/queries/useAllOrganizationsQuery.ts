import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { OrganizationPaginatedResponseFields } from "@/api";

const useAllOrganizationsQuery = () => {
  const api = useApi();

  return useQuery<
    OrganizationPaginatedResponseFields[],
    AxiosError<ErrorResponseData>
  >({
    queryKey: ["organizations", "list"],
    queryFn: () =>
      api.organizations
        .findOrganizationPaginatedHttpControllerGetOrganizationPaginated({
          limit: Number.MAX_SAFE_INTEGER,
        })
        .then(({ data }) => data.items),
  });
};

export default useAllOrganizationsQuery;
