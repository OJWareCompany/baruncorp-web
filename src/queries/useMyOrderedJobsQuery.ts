import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import {
  FindMyOrderedJobPaginatedHttpControllerFindJobParams,
  JobPaginatedResponseDto,
} from "@/api";

export const getMyOrderedJobsQueryKey = (
  params: FindMyOrderedJobPaginatedHttpControllerFindJobParams
) => ["my-ordered-jobs", "list", params];

const useMyOrderedJobsQuery = (
  params: FindMyOrderedJobPaginatedHttpControllerFindJobParams,
  keepPreviousData?: boolean
) => {
  const api = useApi();

  return useQuery<JobPaginatedResponseDto, AxiosError<ErrorResponseData>>({
    queryKey: getMyOrderedJobsQueryKey(params),
    queryFn: () =>
      api.myOrderedJobs
        .findMyOrderedJobPaginatedHttpControllerFindJob(params)
        .then(({ data }) => data),
    keepPreviousData,
  });
};

export default useMyOrderedJobsQuery;
