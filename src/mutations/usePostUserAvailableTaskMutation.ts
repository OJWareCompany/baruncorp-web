import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { AddAvailableTaskRequestDto } from "@/api/api-spec";

const usePostUserAvailableTaskMutation = (userId: string) => {
  const api = useApi();

  return useMutation<
    void,
    AxiosError<ErrorResponseData>,
    AddAvailableTaskRequestDto
  >({
    mutationFn: (reqData) => {
      return api.users
        .addAvailableTaskHttpControllerPost(userId, reqData)
        .then(({ data: resData }) => resData);
    },
  });
};

export default usePostUserAvailableTaskMutation;
