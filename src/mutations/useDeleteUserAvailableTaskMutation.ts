import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";

const useDeleteUserAvailableTaskMutation = () => {
  const api = useApi();

  return useMutation<
    void,
    AxiosError<ErrorResponseData>,
    { userId: string; taskId: string }
  >((reqData) => {
    return api.users
      .deleteAvailableTaskHttpControllerDelete(reqData.userId, reqData.taskId)
      .then(({ data: resData }) => resData);
  });
};

export default useDeleteUserAvailableTaskMutation;
