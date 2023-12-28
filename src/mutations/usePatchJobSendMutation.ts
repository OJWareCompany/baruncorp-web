import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { SendDeliverablesRequestDto } from "@/api";

const usePatchJobSendMutation = (jobId: string) => {
  const api = useApi();

  return useMutation<
    void,
    AxiosError<ErrorResponseData>,
    SendDeliverablesRequestDto
  >((reqData) => {
    return api.jobs
      .sendDeliverablesHttpControllerUpdateJob(jobId, reqData)
      .then(({ data: resData }) => resData);
  });
};

export default usePatchJobSendMutation;
