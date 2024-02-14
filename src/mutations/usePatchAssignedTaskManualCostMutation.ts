import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { UpdateTaskCostRequestDto } from "@/api/api-spec";

const usePatchAssignedTaskManualCostMutation = (assignedTaskId: string) => {
  const api = useApi();

  return useMutation<
    void,
    AxiosError<ErrorResponseData>,
    UpdateTaskCostRequestDto
  >((reqData) => {
    return api.assignedTasks
      .updateTaskCostHttpControllerPatch(assignedTaskId, reqData)
      .then(({ data: resData }) => resData);
  });
};

export default usePatchAssignedTaskManualCostMutation;
