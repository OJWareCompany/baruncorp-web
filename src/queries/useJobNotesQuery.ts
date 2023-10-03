import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { JobNoteListResponseDto } from "@/api";

interface Props {
  jobId: string;
}

const useJobNotesQuery = ({ jobId }: Props) => {
  const api = useApi();

  return useQuery<JobNoteListResponseDto, AxiosError<ErrorResponseData>>({
    queryKey: ["job-notes", "list", { jobId }],
    queryFn: () =>
      api.orderedJobNotes
        .findJobNotesHttpControllerFind(jobId)
        .then(({ data }) => data),
    enabled: jobId !== "",
  });
};

export default useJobNotesQuery;
