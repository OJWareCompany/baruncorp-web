import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import {
  FindMyOrderedJobPaginatedHttpControllerFindJobParams,
  JobPaginatedResponseDto,
} from "@/api/api-spec";

export const getMyOrderedJobsQueryKey = (
  params: FindMyOrderedJobPaginatedHttpControllerFindJobParams
) => ["my-ordered-jobs", "list", params];

const useMyOrderedJobsQuery = (
  params: FindMyOrderedJobPaginatedHttpControllerFindJobParams,
  isKeepPreviousData?: boolean
) => {
  const api = useApi();

  return useQuery<JobPaginatedResponseDto, AxiosError<ErrorResponseData>>({
    queryKey: getMyOrderedJobsQueryKey(params),
    queryFn: () =>
      api.myOrderedJobs
        .findMyOrderedJobPaginatedHttpControllerFindJob(params)
        .then(({ data }) => data),
    placeholderData: isKeepPreviousData ? keepPreviousData : undefined,
  });
};

export default useMyOrderedJobsQuery;
