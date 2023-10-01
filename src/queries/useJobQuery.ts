import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { JobResponseDto } from "@/api";

const useJobQuery = ({
  jobId,
  initialData,
}: {
  jobId: string;
  initialData?: JobResponseDto | null;
}) => {
  const api = useApi();

  return useQuery<JobResponseDto, AxiosError<ErrorResponseData>>({
    queryKey: ["jobs", "detail", jobId],
    queryFn: () =>
      api.jobs.findJobHttpControllerFindJob(jobId).then(({ data }) => data),
    enabled: jobId !== "",
    initialData: initialData == null ? undefined : initialData,
  });
};

export default useJobQuery;
