import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { UpdateUserRequestDto } from "../api/index";
import useApi from "@/hook/useApi";
import useUsersControllerGetUserInfoQueryInvalidation from "@/hook/useUsersControllerGetUserInfoQueryInvalidation";
import useProfileQueryInvalidation from "@/hook/useProfileQueryInvalidation";

const useUsersControllerUpdateUserMutation = (userId: string | undefined) => {
  const api = useApi();
  // const invalidate = useUsersControllerGetUserInfoQueryInvalidation();
  const invalidate = useProfileQueryInvalidation(userId);

  return useMutation<void, AxiosError<ErrorResponseData>, UpdateUserRequestDto>(
    (data) => {
      return api.users.usersControllerUpdateUser(data).then(({ data }) => data);
    },
    {
      onSuccess: () => invalidate(),
    }
  );
};

export default useUsersControllerUpdateUserMutation;
