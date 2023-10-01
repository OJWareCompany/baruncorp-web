import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import {
  ProjectPaginatedResponseDto,
  ProjectPaginatedResponseFields,
} from "@/api";

const useAllProjectsByOrganizationIdQuery = (organizationId: string) => {
  const api = useApi();

  return useQuery<ProjectPaginatedResponseDto, AxiosError<ErrorResponseData>>({
    queryKey: ["projects", "list", { organizationId }],
    queryFn: () =>
      api.projects
        .findProjectsHttpControllerFindUsers({
          organizationId,
          limit: Number.MAX_SAFE_INTEGER,
        })
        .then(({ data }) => data),
  });
};

export default useAllProjectsByOrganizationIdQuery;
