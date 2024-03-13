import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";

interface Variables {
  assignedTaskId: string;
}

const usePatchAssignedTaskCancelMutation = () => {
  const api = useApi();

  return useMutation<void, AxiosError<ErrorResponseData>, Variables>({
    mutationFn: ({ assignedTaskId }) => {
      return api.assignedTasks
        .cancelAssignedTaskHttpControllerCancel(assignedTaskId)
        .then(({ data: resData }) => resData);
    },
  });
};

export default usePatchAssignedTaskCancelMutation;
