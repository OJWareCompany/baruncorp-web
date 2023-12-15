import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { UserResponseDto } from "@/api";

export const getUserQueryKey = (userId: string) => ["users", "detail", userId];

const useUserQuery = (userId: string) => {
  const api = useApi();

  return useQuery<UserResponseDto, AxiosError<ErrorResponseData>>({
    queryKey: getUserQueryKey(userId),
    queryFn: () =>
      api.users
        .usersControllerGetUserInfoByUserId(userId)
        .then(({ data }) => data),
    enabled: userId !== "",
  });
};

export default useUserQuery;
