import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { CreateJobRequestDto, IdResponse } from "@/api/api-spec";

const usePostJobMutation = () => {
  const api = useApi();

  return useMutation<
    IdResponse,
    AxiosError<ErrorResponseData>,
    CreateJobRequestDto
  >((reqData) => {
    return api.jobs
      .createJobHttpControllerCreateJob(reqData)
      .then(({ data: resData }) => resData);
  });
};

export default usePostJobMutation;
