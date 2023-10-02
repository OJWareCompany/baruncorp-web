import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { PaginationState } from "@tanstack/react-table";
import useApi from "@/hook/useApi";
import { OrganizationPaginatedResponseDto } from "@/api";

interface Props {
  pagination: PaginationState;
}

const usePaginatedOrganizationsQuery = ({
  pagination: { pageIndex, pageSize },
}: Props) => {
  const api = useApi();

  return useQuery<
    OrganizationPaginatedResponseDto,
    AxiosError<ErrorResponseData>
  >({
    queryKey: ["projects", "list", { pageIndex, pageSize }],
    queryFn: () =>
      api.organizations
        .findOrganizationPaginatedHttpControllerGetOrganizationPaginated({
          page: pageIndex + 1,
          limit: pageSize,
        })
        .then(({ data }) => data),
    keepPreviousData: true,
  });
};

export default usePaginatedOrganizationsQuery;
