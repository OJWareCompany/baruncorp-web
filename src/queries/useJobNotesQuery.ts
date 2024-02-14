import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { JobNoteResponseDto } from "@/api/api-spec";

export const getJobNotesQueryKey = (jobId: string) => [
  "job-notes",
  "list",
  jobId,
];

const useJobNotesQuery = (jobId: string) => {
  const api = useApi();

  return useQuery<JobNoteResponseDto, AxiosError<ErrorResponseData>>({
    queryKey: getJobNotesQueryKey(jobId),
    queryFn: () =>
      api.orderedJobNotes
        .findJobNotesHttpControllerFind(jobId)
        .then(({ data }) => data),
    enabled: jobId !== "",
  });
};

export default useJobNotesQuery;
