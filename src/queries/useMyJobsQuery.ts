import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import {
  FindJobPaginatedHttpControllerFindJobParams,
  JobPaginatedResponseDto,
} from "@/api";

export const getMyJobsQueryKey = (
  params: FindJobPaginatedHttpControllerFindJobParams
) => ["my-jobs", "list", params];

const useMyJobsQuery = (
  params: FindJobPaginatedHttpControllerFindJobParams,
  keepPreviousData?: boolean
) => {
  const api = useApi();

  return useQuery<JobPaginatedResponseDto, AxiosError<ErrorResponseData>>({
    queryKey: getMyJobsQueryKey(params),
    queryFn: () =>
      api.myJobs
        .findMyJobPaginatedHttpControllerFindJob(params)
        .then(({ data }) => data),
    keepPreviousData,
  });
};

export default useMyJobsQuery;
