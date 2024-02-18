import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { UpdatePositionTaskAutoAssignmentTypeRequestDto } from "@/api/api-spec";

interface Variables extends UpdatePositionTaskAutoAssignmentTypeRequestDto {
  positionId: string;
  taskId: string;
}

const usePatchPositionTaskMutation = () => {
  const api = useApi();

  return useMutation<void, AxiosError<ErrorResponseData>, Variables>({
    mutationFn: ({ positionId, taskId, ...reqData }) => {
      return api.positions
        .updatePositionTaskAutoAssignmentTypeHttpControllerPatch(
          positionId,
          taskId,
          reqData
        )
        .then(({ data: resData }) => resData);
    },
  });
};

export default usePatchPositionTaskMutation;
