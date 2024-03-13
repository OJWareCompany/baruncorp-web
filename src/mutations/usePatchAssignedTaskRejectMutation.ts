import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { RejectAssignedTaskRequestDto } from "@/api/api-spec";

interface Variables extends RejectAssignedTaskRequestDto {
  assignedTaskId: string;
}

const usePatchAssignedTaskRejectMutation = () => {
  const api = useApi();

  return useMutation<void, AxiosError<ErrorResponseData>, Variables>({
    mutationFn: ({ assignedTaskId, ...reqData }) => {
      return api.assignedTasks
        .rejectAssignedTaskHttpControllerPatch(assignedTaskId, reqData)
        .then(({ data: resData }) => resData);
    },
  });
};

export default usePatchAssignedTaskRejectMutation;
