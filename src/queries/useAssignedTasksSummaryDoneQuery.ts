import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import {
  FindAssignedTaskSummaryDonePaginatedHttpControllerGetParams,
  AssignedTaskSummaryDonePaginatedResponseDto,
} from "@/api/api-spec";

export const getAssignedTasksSummaryDoneQueryKey = (
  params: FindAssignedTaskSummaryDonePaginatedHttpControllerGetParams
) => ["assigned-tasks-summary-done", "list", params];

const useAssignedTasksSummaryDoneQuery = (
  params: FindAssignedTaskSummaryDonePaginatedHttpControllerGetParams,
  isKeepPreviousData?: boolean
) => {
  const api = useApi();

  return useQuery<
    AssignedTaskSummaryDonePaginatedResponseDto,
    AxiosError<ErrorResponseData>
  >({
    queryKey: getAssignedTasksSummaryDoneQueryKey(params),
    queryFn: () =>
      api.assignedTasks
        .findAssignedTaskSummaryDonePaginatedHttpControllerGet(params)
        .then(({ data }) => data),
    placeholderData: isKeepPreviousData ? keepPreviousData : undefined,
    // enabled:
    //   params.startedAt != null &&
    //   params.startedAt !== "" &&
    //   params.endedAt != null &&
    //   params.endedAt !== "",
  });
};

export default useAssignedTasksSummaryDoneQuery;
