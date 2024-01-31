import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { ModifyAssignmentTypeOfAvailableTaskRequestDto } from "@/api/api-spec";

interface Variables extends ModifyAssignmentTypeOfAvailableTaskRequestDto {
  taskId: string;
}

const usePatchUserAvailableTaskMutation = (userId: string) => {
  const api = useApi();

  return useMutation<void, AxiosError<ErrorResponseData>, Variables>(
    (reqData) => {
      return api.users
        .modifyAssignmentTypeOfAvailableTaskHttpControllerPatch(
          userId,
          reqData.taskId,
          {
            autoAssignmentType: reqData.autoAssignmentType,
          }
        )
        .then(({ data: resData }) => resData);
    }
  );
};

export default usePatchUserAvailableTaskMutation;
