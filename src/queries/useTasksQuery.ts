import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import {
  FindTaskPaginatedHttpControllerGetParams,
  TaskPaginatedResponseDto,
} from "@/api";

export const getTasksQueryKey = (
  params: FindTaskPaginatedHttpControllerGetParams
) => ["tasks", "list", params];

const useTasksQuery = (params: FindTaskPaginatedHttpControllerGetParams) => {
  const api = useApi();

  return useQuery<TaskPaginatedResponseDto, AxiosError<ErrorResponseData>>({
    queryKey: getTasksQueryKey(params),
    queryFn: () =>
      api.tasks
        .findTaskPaginatedHttpControllerGet(params)
        .then(({ data }) => data),
  });
};

export default useTasksQuery;
