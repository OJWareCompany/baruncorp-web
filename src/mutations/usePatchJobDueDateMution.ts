import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { UpdateJobDueDateRequestDto } from "@/api/api-spec";

const usePatchJobDueDateMutation = (jobId: string) => {
  const api = useApi();

  return useMutation<
    void,
    AxiosError<ErrorResponseData>,
    UpdateJobDueDateRequestDto
  >({
    mutationFn: (reqData) => {
      return api.jobs
        .updateJobDueDateHttpControllerUpdateJob(jobId, reqData)
        .then(({ data: resData }) => resData);
    },
  });
};

export default usePatchJobDueDateMutation;
