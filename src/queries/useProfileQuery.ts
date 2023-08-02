import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { UserResponseDto } from "@/api";

export const QUERY_KEY = "profile";

const useProfileQuery = () => {
  const api = useApi();

  return useQuery<UserResponseDto, AxiosError<ErrorResponseData>>({
    queryKey: [QUERY_KEY],
    queryFn: () =>
      api.users.usersControllerGetUserInfo().then(({ data }) => data),
  });
};

export default useProfileQuery;
