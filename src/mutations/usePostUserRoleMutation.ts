import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { ChangeUserRoleRequestDto, IdResponse } from "@/api/api-spec";

const usePostUserRoleMutation = (userId: string) => {
  const api = useApi();

  return useMutation<
    IdResponse,
    AxiosError<ErrorResponseData>,
    ChangeUserRoleRequestDto
  >({
    mutationFn: (reqData) => {
      return api.users
        .changeUserRoleHttpControllerPost(userId, reqData)
        .then(({ data: resData }) => resData);
    },
  });
};

export default usePostUserRoleMutation;
