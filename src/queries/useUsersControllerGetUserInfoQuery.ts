import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApiClient from "@/hook/useApiClient";
import { UserResponseDto } from "@/api";

export const QUERY_KEY = "usersControllerGetUserInfo";

const useUsersControllerGetUserInfoQuery = () => {
  const apiClient = useApiClient();

  return useQuery<UserResponseDto, AxiosError<ErrorResponseData>>({
    queryKey: [QUERY_KEY],
    queryFn: () =>
      apiClient.users.usersControllerGetUserInfo().then(({ data }) => data),
  });
};

export default useUsersControllerGetUserInfoQuery;
