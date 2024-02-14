import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import {
  FindAssignedTaskSummaryInProgressPaginatedHttpControllerGetParams,
  AssignedTaskSummaryInProgressPaginatedResponseDto,
} from "@/api/api-spec";

export const getAssignedTasksSummaryInProgressQueryKey = (
  params: FindAssignedTaskSummaryInProgressPaginatedHttpControllerGetParams
) => ["assigned-tasks-summary-in-progress", "list", params];

const useAssignedTasksSummaryInProgressQuery = (
  params: FindAssignedTaskSummaryInProgressPaginatedHttpControllerGetParams,
  keepPreviousData?: boolean
) => {
  const api = useApi();

  return useQuery<
    AssignedTaskSummaryInProgressPaginatedResponseDto,
    AxiosError<ErrorResponseData>
  >({
    queryKey: getAssignedTasksSummaryInProgressQueryKey(params),
    queryFn: () =>
      api.assignedTasks
        .findAssignedTaskSummaryInProgressPaginatedHttpControllerGet(params)
        .then(({ data }) => data),
    keepPreviousData,
  });
};

export default useAssignedTasksSummaryInProgressQuery;
