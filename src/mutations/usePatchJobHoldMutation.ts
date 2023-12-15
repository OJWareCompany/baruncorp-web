import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";

const usePatchJobHoldMutation = (jobId: string) => {
  const api = useApi();

  return useMutation<void, AxiosError<ErrorResponseData>>(() => {
    return api.jobs
      .holdJobHttpControllerUpdateJob(jobId)
      .then(({ data: resData }) => resData);
  });
};

export default usePatchJobHoldMutation;
