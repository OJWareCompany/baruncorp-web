import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { JobResponseDto } from "@/api";

export const getJobQueryKey = (jobId: string) => ["jobs", "detail", jobId];

const useJobQuery = (jobId: string) => {
  const api = useApi();

  return useQuery<JobResponseDto, AxiosError<ErrorResponseData>>({
    queryKey: getJobQueryKey(jobId),
    queryFn: () =>
      api.jobs.findJobHttpControllerFindJob(jobId).then(({ data }) => data),
    enabled: jobId !== "",
  });
};

export default useJobQuery;
