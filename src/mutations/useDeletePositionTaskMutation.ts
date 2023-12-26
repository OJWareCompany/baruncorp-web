import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";

const useDeletePositionTaskMutation = () => {
  const api = useApi();

  return useMutation<
    void,
    AxiosError<ErrorResponseData>,
    {
      positionId: string;
      taskId: string;
    }
  >((reqData) => {
    return api.positions
      .deletePositionTaskHttpControllerDelete(
        reqData.positionId,
        reqData.taskId
      )
      .then(({ data: resData }) => resData);
  });
};

export default useDeletePositionTaskMutation;
