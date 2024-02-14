import { useQuery } from "@tanstack/react-query";
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
  keepPreviousData,
}: {
  params: FindAssignedTaskSummaryDetailPaginatedHttpControllerGetParams;
  enabled?: boolean;
  keepPreviousData?: boolean;
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
    keepPreviousData,
    enabled,
  });
};

export default useAssignedTasksSummaryDetailsQuery;
