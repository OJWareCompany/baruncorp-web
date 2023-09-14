import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { UserResponseDto } from "@/api";

const useUserByUserIdQuery = (userId: string) => {
  const api = useApi();

  return useQuery<UserResponseDto, AxiosError<ErrorResponseData>>({
    queryKey: ["users", "detail", userId],
    queryFn: () => {
      return api.users
        .usersControllerGetUserInfoByUserId(userId)
        .then(({ data }) => data);
    },
    enabled: userId !== "",
  });
};

export default useUserByUserIdQuery;
