import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { UserResponseDto } from "@/api";

export const getProfileQueryKey = () => ["profile"];

const useProfileQuery = () => {
  const api = useApi();

  return useQuery<UserResponseDto, AxiosError<ErrorResponseData>>({
    queryKey: getProfileQueryKey(),
    queryFn: () =>
      api.users.usersControllerGetUserInfo().then(({ data }) => data),
  });
};

export default useProfileQuery;
