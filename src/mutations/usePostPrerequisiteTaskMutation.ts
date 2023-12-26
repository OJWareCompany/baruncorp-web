import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { AddPrerequisiteTaskRequestDto } from "@/api";

const usePostPrerequisiteTaskMutation = (taskId: string) => {
  const api = useApi();

  return useMutation<
    void,
    AxiosError<ErrorResponseData>,
    AddPrerequisiteTaskRequestDto
  >((reqData) => {
    return api.tasks
      .addPrerequisiteTaskHttpControllerPost(taskId, reqData)
      .then(({ data: resData }) => resData);
  });
};

export default usePostPrerequisiteTaskMutation;
