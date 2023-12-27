import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";

const useDeletePrerequisiteTaskMutation = (taskId: string) => {
  const api = useApi();

  return useMutation<
    void,
    AxiosError<ErrorResponseData>,
    {
      prerequisiteTaskId: string;
    }
  >((reqData) => {
    return (
      api.tasks
        // TODO: 중복 제거
        .deletePrerequisiteTaskHttpControllerDelete(
          taskId,
          reqData.prerequisiteTaskId
        )
        .then(({ data: resData }) => resData)
    );
  });
};

export default useDeletePrerequisiteTaskMutation;
