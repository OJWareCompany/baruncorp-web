import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { AddAvailableTaskRequestDto } from "@/api";

const usePostUserAvailableTaskMutation = (userId: string) => {
  const api = useApi();

  return useMutation<
    void,
    AxiosError<ErrorResponseData>,
    AddAvailableTaskRequestDto
  >((reqData) => {
    return api.users
      .addAvailableTaskHttpControllerPost(userId, reqData)
      .then(({ data: resData }) => resData);
  });
};

export default usePostUserAvailableTaskMutation;
