import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";

const usePatchAssignedTaskUnassignMutation = (assignedTaskId: string) => {
  const api = useApi();

  return useMutation<void, AxiosError<ErrorResponseData>>(() => {
    return api.assignedTasks
      .unassignAssignedTaskHttpControllerPatch(assignedTaskId)
      .then(({ data: resData }) => resData);
  });
};

export default usePatchAssignedTaskUnassignMutation;
