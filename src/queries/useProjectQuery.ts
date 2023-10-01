import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { ProjectResponseDto } from "@/api";

const useProjectQuery = ({
  projectId,
  initialData,
}: {
  projectId: string;
  initialData?: ProjectResponseDto | null;
}) => {
  const api = useApi();

  return useQuery<ProjectResponseDto, AxiosError<ErrorResponseData>>({
    queryKey: ["projects", "detail", projectId],
    queryFn: () =>
      api.projects
        .findProjectDetailHttpControllerFindProjectDetail(projectId)
        .then(({ data }) => data),
    enabled: projectId !== "",
    initialData: initialData == null ? undefined : initialData,
  });
};

export default useProjectQuery;
