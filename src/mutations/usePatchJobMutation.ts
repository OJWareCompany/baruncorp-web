import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { UpdateJobRequestDto } from "@/api/api-spec";

const usePatchJobMutation = (jobId: string) => {
  const api = useApi();

  return useMutation<void, AxiosError<ErrorResponseData>, UpdateJobRequestDto>({
    mutationFn: (reqData) => {
      return api.jobs
        .updateJobHttpControllerUpdateJob(jobId, reqData)
        .then(({ data: resData }) => resData);
    },
  });
};

export default usePatchJobMutation;
