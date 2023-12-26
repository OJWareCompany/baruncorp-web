import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { DeletePrerequisiteTaskRequestDto } from "@/api";

const useDeletePrerequisiteTaskMutation = (taskId: string) => {
  const api = useApi();

  return useMutation<
    string, // TODO: IdResponse?
    AxiosError<ErrorResponseData>,
    DeletePrerequisiteTaskRequestDto
  >((reqData) => {
    return (
      api.tasks
        // TODO: 중복 제거
        .deletePrerequisiteTaskHttpControllerDelete(
          taskId,
          reqData.prerequisiteTaskId,
          reqData
        )
        .then(({ data: resData }) => resData)
    );
  });
};

export default useDeletePrerequisiteTaskMutation;
