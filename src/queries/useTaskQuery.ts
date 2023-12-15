import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { TaskResponseDto } from "@/api";

export const getTaskQueryKey = (taskId: string) => ["tasks", "detail", taskId];

const useTaskQuery = (taskId: string) => {
  const api = useApi();

  return useQuery<TaskResponseDto, AxiosError<ErrorResponseData>>({
    queryKey: getTaskQueryKey(taskId),
    queryFn: () =>
      api.tasks.findTaskHttpControllerGet(taskId).then(({ data }) => data),
    enabled: taskId !== "",
  });
};

export default useTaskQuery;
