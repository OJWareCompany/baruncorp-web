import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { AssignTaskRequestDto } from "@/api/api-spec";

interface Variables extends AssignTaskRequestDto {
  assignedTaskId: string;
}

const usePatchAssignMutation = () => {
  const api = useApi();

  return useMutation<void, AxiosError<ErrorResponseData>, Variables>(
    ({ assignedTaskId, ...reqData }) => {
      return api.assignedTasks
        .assignTaskHttpControllerPatch(assignedTaskId, reqData)
        .then(({ data: resData }) => resData);
    }
  );
};

export default usePatchAssignMutation;
