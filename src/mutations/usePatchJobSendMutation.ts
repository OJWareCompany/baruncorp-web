import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";

interface Variables {
  jobId: string;
}

const usePatchJobSendMutation = () => {
  const api = useApi();

  return useMutation<void, AxiosError<ErrorResponseData>, Variables>({
    mutationFn: ({ jobId, ...reqData }) => {
      return api.jobs
        .sendDeliverablesHttpControllerUpdateJob(jobId, reqData)
        .then(({ data: resData }) => resData);
    },
  });
};

export default usePatchJobSendMutation;
