import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";

interface Variables {
  assignedTaskId: string;
}

const usePatchAssignedTaskUnassignMutation = () => {
  const api = useApi();

  return useMutation<void, AxiosError<ErrorResponseData>, Variables>({
    mutationFn: ({ assignedTaskId }) => {
      return api.assignedTasks
        .unassignAssignedTaskHttpControllerPatch(assignedTaskId)
        .then(({ data: resData }) => resData);
    },
  });
};

export default usePatchAssignedTaskUnassignMutation;
