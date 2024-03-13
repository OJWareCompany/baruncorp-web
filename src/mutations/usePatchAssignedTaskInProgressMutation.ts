import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";

interface Variables {
  assignedTaskId: string;
}

const usePatchAssignedTaskInProgressMutation = () => {
  const api = useApi();

  return useMutation<void, AxiosError<ErrorResponseData>, Variables>({
    mutationFn: ({ assignedTaskId }) => {
      return api.assignedTasks
        .updateStatusToInProgressAssignedTaskHttpControllerHold(assignedTaskId)
        .then(({ data: resData }) => resData);
    },
  });
};

export default usePatchAssignedTaskInProgressMutation;
