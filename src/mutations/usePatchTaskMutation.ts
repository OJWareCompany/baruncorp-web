import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { UpdateTaskRequestDto } from "@/api";

const usePatchTaskMutation = (taskId: string) => {
  const api = useApi();

  return useMutation<void, AxiosError<ErrorResponseData>, UpdateTaskRequestDto>(
    (reqData) => {
      return api.tasks
        .updateTaskHttpControllerPatch(taskId, reqData)
        .then(({ data: resData }) => resData);
    }
  );
};

export default usePatchTaskMutation;
