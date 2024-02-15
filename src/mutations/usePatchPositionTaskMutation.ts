import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { UpdatePositionTaskAutoAssignmentTypeRequestDto } from "@/api/api-spec";

interface Variables extends UpdatePositionTaskAutoAssignmentTypeRequestDto {
  taskId: string;
}

const usePatchPositionTaskMutation = (positionId: string) => {
  const api = useApi();

  return useMutation<void, AxiosError<ErrorResponseData>, Variables>({
    mutationFn: (reqData) => {
      return api.positions
        .updatePositionTaskAutoAssignmentTypeHttpControllerPatch(
          positionId,
          reqData.taskId,
          {
            autoAssignmentType: reqData.autoAssignmentType,
          }
        )
        .then(({ data: resData }) => resData);
    },
  });
};

export default usePatchPositionTaskMutation;
