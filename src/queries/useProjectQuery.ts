import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { ProjectResponseDto } from "@/api/api-spec";

export const getProjectQueryKey = (projectId: string) => [
  "projects",
  "detail",
  projectId,
];

const useProjectQuery = (projectId: string) => {
  const api = useApi();

  return useQuery<ProjectResponseDto, AxiosError<ErrorResponseData>>({
    queryKey: getProjectQueryKey(projectId),
    queryFn: () =>
      api.projects
        .findProjectDetailHttpControllerFindProjectDetail(projectId)
        .then(({ data }) => data),
    enabled: projectId !== "",
  });
};

export default useProjectQuery;
