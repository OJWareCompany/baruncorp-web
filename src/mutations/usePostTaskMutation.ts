import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { CreateTaskRequestDto, IdResponse } from "@/api/api-spec";

const usePostTaskMutation = () => {
  const api = useApi();

  return useMutation<
    IdResponse,
    AxiosError<ErrorResponseData>,
    CreateTaskRequestDto
  >((reqData) => {
    return api.tasks
      .createTaskHttpControllerPost(reqData)
      .then(({ data: resData }) => resData);
  });
};

export default usePostTaskMutation;
