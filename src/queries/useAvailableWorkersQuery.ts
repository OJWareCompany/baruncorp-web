import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { AvailableWorkerResponseDto } from "@/api/api-spec";

export const getAvailableWorkersQueryKey = (assignedTaskId: string) => [
  "available-workers",
  "detail",
  assignedTaskId,
];

const useAvailableWorkersQuery = (assignedTaskId: string) => {
  const api = useApi();

  return useQuery<AvailableWorkerResponseDto[], AxiosError<ErrorResponseData>>({
    queryKey: getAvailableWorkersQueryKey(assignedTaskId),
    queryFn: () =>
      api.assignedTasks
        .findAvailableWorkersHttpControllerGet(assignedTaskId)
        .then(({ data }) => data),
    enabled: assignedTaskId !== "",
  });
};

export default useAvailableWorkersQuery;
