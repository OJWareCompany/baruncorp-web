import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { UpdateUserRequestDto } from "../api/index";
import useApi from "@/hook/useApi";
import useProfileQueryInvalidation from "@/hook/useProfileQueryInvalidation";
// import useUsersControllerGetUserInfoByUserIdQueryInvalidation from "@/hook/useUsersControllerGetUserInfoByUserIdQueryInvalidation";

const useUsersControllerUpdateUserByUserIdMutation = (
  userId: string | undefined
) => {
  const api = useApi();
  const invalidate = useProfileQueryInvalidation(userId);
  // const invalidate = useUsersControllerGetUserInfoByUserIdQueryInvalidation(userId);

  return useMutation<void, AxiosError<ErrorResponseData>, UpdateUserRequestDto>(
    (data) => {
      if (userId == null) {
        return Promise.reject("userId is undefined.");
      }

      return api.users
        .usersControllerUpdateUserByUserId(userId, data)
        .then(({ data }) => data);
    },
    {
      onSuccess: () => invalidate(),
    }
  );
};

export default useUsersControllerUpdateUserByUserIdMutation;
