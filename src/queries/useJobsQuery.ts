import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import {
  FindJobPaginatedHttpControllerFindJobParams,
  JobPaginatedResponseDto,
} from "@/api/api-spec";

export const getJobsQueryKey = (
  params: FindJobPaginatedHttpControllerFindJobParams
) => ["jobs", "list", params];

const useJobsQuery = (
  params: FindJobPaginatedHttpControllerFindJobParams,
  keepPreviousData?: boolean
) => {
  const api = useApi();

  return useQuery<JobPaginatedResponseDto, AxiosError<ErrorResponseData>>({
    queryKey: getJobsQueryKey(params),
    queryFn: () =>
      api.jobs
        .findJobPaginatedHttpControllerFindJob(params)
        .then(({ data }) => data),
    keepPreviousData,
  });
};

export default useJobsQuery;
