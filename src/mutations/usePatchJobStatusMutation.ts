import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { UpdateJobStatusRequestDto } from "@/api/api-spec";

interface Variables extends UpdateJobStatusRequestDto {
  jobId: string;
}

const usePatchJobStatusMutation = () => {
  const api = useApi();

  return useMutation<void, AxiosError<ErrorResponseData>, Variables>(
    ({ jobId, ...reqData }) => {
      return api.jobs
        .updateJobStatusHttpControllerUpdateJob(jobId, reqData)
        .then(({ data: resData }) => resData);
    }
  );
};

export default usePatchJobStatusMutation;
