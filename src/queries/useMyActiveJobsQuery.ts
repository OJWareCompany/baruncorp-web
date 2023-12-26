import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import {
  FindMyActiveJobPaginatedHttpControllerFindJobParams,
  JobPaginatedResponseDto,
} from "@/api";

export const getMyActiveJobsQueryKey = (
  params: FindMyActiveJobPaginatedHttpControllerFindJobParams
) => ["my-active-jobs", "list", params];

const useMyActiveJobsQuery = (
  params: FindMyActiveJobPaginatedHttpControllerFindJobParams,
  keepPreviousData?: boolean
) => {
  const api = useApi();

  return useQuery<JobPaginatedResponseDto, AxiosError<ErrorResponseData>>({
    queryKey: getMyActiveJobsQueryKey(params),
    queryFn: () =>
      api.myActiveJobs
        .findMyActiveJobPaginatedHttpControllerFindJob(params)
        .then(({ data }) => data),
    keepPreviousData,
  });
};

export default useMyActiveJobsQuery;
