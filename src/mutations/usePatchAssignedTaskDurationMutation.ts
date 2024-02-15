import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { UpdateTaskDurationRequestDto } from "@/api/api-spec";

const usePatchAssignedTaskDurationMutation = (assignedTaskId: string) => {
  const api = useApi();

  return useMutation<
    void,
    AxiosError<ErrorResponseData>,
    UpdateTaskDurationRequestDto
  >({
    mutationFn: (reqData) => {
      return api.assignedTasks
        .updateTaskDurationHttpControllerPatch(assignedTaskId, reqData)
        .then(({ data: resData }) => resData);
    },
  });
};

export default usePatchAssignedTaskDurationMutation;
