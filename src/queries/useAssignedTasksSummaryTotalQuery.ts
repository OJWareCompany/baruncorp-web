import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import {
  FindAssignedTaskSummaryTotalPaginatedHttpControllerGetParams,
  AssignedTaskSummaryTotalPaginatedResponseDto,
} from "@/api/api-spec";

export const getAssignedTasksSummaryTotalQueryKey = (
  params: FindAssignedTaskSummaryTotalPaginatedHttpControllerGetParams
) => ["assigned-tasks-summary-total", "list", params];

const useAssignedTasksSummaryTotalQuery = ({
  params,
  enabled,
  keepPreviousData,
}: {
  params: FindAssignedTaskSummaryTotalPaginatedHttpControllerGetParams;
  enabled?: boolean;
  keepPreviousData?: boolean;
}) => {
  const api = useApi();

  return useQuery<
    AssignedTaskSummaryTotalPaginatedResponseDto,
    AxiosError<ErrorResponseData>
  >({
    queryKey: getAssignedTasksSummaryTotalQueryKey(params),
    queryFn: () =>
      api.assignedTasks
        .findAssignedTaskSummaryTotalPaginatedHttpControllerGet(params)
        .then(({ data }) => data),
    keepPreviousData,
    enabled,
  });
};

export default useAssignedTasksSummaryTotalQuery;
