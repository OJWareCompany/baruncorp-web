import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import {
  FindMyJobPaginatedHttpControllerFindJobParams,
  JobPaginatedResponseDto,
} from "@/api/api-spec";

export const getMyJobsQueryKey = (
  params: FindMyJobPaginatedHttpControllerFindJobParams
) => ["my-jobs", "list", params];

const useMyJobsQuery = (
  params: FindMyJobPaginatedHttpControllerFindJobParams,
  isKeepPreviousData?: boolean
) => {
  const api = useApi();

  return useQuery<JobPaginatedResponseDto, AxiosError<ErrorResponseData>>({
    queryKey: getMyJobsQueryKey(params),
    queryFn: () =>
      api.myJobs
        .findMyJobPaginatedHttpControllerFindJob(params)
        .then(({ data }) => data),
    placeholderData: isKeepPreviousData ? keepPreviousData : undefined,
  });
};

export default useMyJobsQuery;
