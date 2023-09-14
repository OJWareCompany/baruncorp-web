import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { PaginationState } from "@tanstack/react-table";
import useApi from "@/hook/useApi";
import { ProjectPaginatedResponseDto } from "@/api";

interface Props {
  pagination: PaginationState;
  initialData: ProjectPaginatedResponseDto;
}

const useProjectsQuery = ({
  initialData,
  pagination: { pageIndex, pageSize },
}: Props) => {
  const api = useApi();

  return useQuery<ProjectPaginatedResponseDto, AxiosError<ErrorResponseData>>({
    queryKey: ["projects", "list", { pageIndex, pageSize }],
    queryFn: () =>
      api.projects
        .findProjectsHttpControllerFindUsers({
          propertyType: null,
          projectNumber: null,
          propertyFullAddress: null,
          organizationId: null,
          page: pageIndex + 1,
          limit: pageSize,
        })
        .then(({ data }) => data),
    initialData,
  });
};

export default useProjectsQuery;
