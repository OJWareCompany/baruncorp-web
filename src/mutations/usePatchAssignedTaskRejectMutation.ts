import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { RejectAssignedTaskRequestDto } from "@/api/api-spec";

const usePatchAssignedTaskRejectMutation = (assignedTaskId: string) => {
  const api = useApi();

  return useMutation<
    void,
    AxiosError<ErrorResponseData>,
    RejectAssignedTaskRequestDto
  >({
    mutationFn: (reqData) => {
      return api.assignedTasks
        .rejectAssignedTaskHttpControllerPatch(assignedTaskId, reqData)
        .then(({ data: resData }) => resData);
    },
  });
};

export default usePatchAssignedTaskRejectMutation;
