import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { AssignTaskRequestDto } from "@/api";

const usePatchAssignMutation = (assignedTaskId: string) => {
  const api = useApi();

  return useMutation<void, AxiosError<ErrorResponseData>, AssignTaskRequestDto>(
    (reqData) => {
      return api.assignedTasks
        .assignTaskHttpControllerPatch(assignedTaskId, reqData)
        .then(({ data: resData }) => resData);
    }
  );
};

export default usePatchAssignMutation;
