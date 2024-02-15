import { keepPreviousData, useQuery } from "@tanstack/react-query";
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
  isKeepPreviousData,
}: {
  params: FindAssignedTaskSummaryTotalPaginatedHttpControllerGetParams;
  enabled?: boolean;
  isKeepPreviousData?: boolean;
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
    placeholderData: isKeepPreviousData ? keepPreviousData : undefined,

    enabled,
  });
};

export default useAssignedTasksSummaryTotalQuery;
