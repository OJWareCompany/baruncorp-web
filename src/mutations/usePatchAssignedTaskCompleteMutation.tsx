import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";

const usePatchAssignedTaskCompleteMutation = (assignedTaskId: string) => {
  const api = useApi();

  return useMutation<void, AxiosError<ErrorResponseData>>(() => {
    return api.assignedTasks
      .completeAssignedTaskHttpControllerPatch(assignedTaskId)
      .then(({ data: resData }) => resData);
  });
};

export default usePatchAssignedTaskCompleteMutation;
