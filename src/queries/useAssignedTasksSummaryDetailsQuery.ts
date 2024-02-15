import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import {
  FindAssignedTaskSummaryDetailPaginatedHttpControllerGetParams,
  AssignedTaskSummaryDetailPaginatedResponseDto,
} from "@/api/api-spec";

export const getAssignedTasksSummaryDetailsQueryKey = (
  params: FindAssignedTaskSummaryDetailPaginatedHttpControllerGetParams
) => ["assigned-tasks-summary-details", "list", params];

const useAssignedTasksSummaryDetailsQuery = ({
  params,
  enabled,
  isKeepPreviousData,
}: {
  params: FindAssignedTaskSummaryDetailPaginatedHttpControllerGetParams;
  enabled?: boolean;
  isKeepPreviousData?: boolean;
}) => {
  const api = useApi();

  return useQuery<
    AssignedTaskSummaryDetailPaginatedResponseDto,
    AxiosError<ErrorResponseData>
  >({
    queryKey: getAssignedTasksSummaryDetailsQueryKey(params),
    queryFn: () =>
      api.assignedTasks
        .findAssignedTaskSummaryDetailPaginatedHttpControllerGet(params)
        .then(({ data }) => data),
    placeholderData: isKeepPreviousData ? keepPreviousData : undefined,
    enabled,
  });
};

export default useAssignedTasksSummaryDetailsQuery;
