import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";

interface Variables {
  assignedTaskId: string;
}

const usePatchAssignedTaskHoldMutation = () => {
  const api = useApi();

  return useMutation<void, AxiosError<ErrorResponseData>, Variables>({
    mutationFn: ({ assignedTaskId }) => {
      return api.assignedTasks
        .holdAssignedTaskHttpControllerHold(assignedTaskId)
        .then(({ data: resData }) => resData);
    },
  });
};

export default usePatchAssignedTaskHoldMutation;
