import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { UserResponseDto } from "@/api";

export const QUERY_KEY = "usersControllerGetUserInfoByUserId";

const useUsersControllerGetUserInfoByUserIdQuery = (userId: string) => {
  const api = useApi();

  return useQuery<UserResponseDto, AxiosError<ErrorResponseData>>({
    queryKey: [QUERY_KEY, userId],
    queryFn: () => {
      return api.users
        .usersControllerGetUserInfoByUserId(userId)
        .then(({ data }) => data);
    },
  });
};

export default useUsersControllerGetUserInfoByUserIdQuery;
