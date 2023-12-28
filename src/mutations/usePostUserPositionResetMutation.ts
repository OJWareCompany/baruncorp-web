import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";

const usePostUserPositionResetMutation = (userId: string) => {
  const api = useApi();

  return useMutation<void, AxiosError<ErrorResponseData>>(() => {
    return api.users
      .resetDefaultTasksHttpControllerPost(userId)
      .then(({ data: resData }) => resData);
  });
};

export default usePostUserPositionResetMutation;
