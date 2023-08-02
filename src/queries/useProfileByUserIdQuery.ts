import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { QUERY_KEY as profileQueryKey } from "./useProfileQuery";
import useApi from "@/hook/useApi";
import { UserResponseDto } from "@/api";

const useProfileByUserIdQuery = (userId: string) => {
  const api = useApi();

  return useQuery<UserResponseDto, AxiosError<ErrorResponseData>>({
    queryKey: [profileQueryKey, userId],
    queryFn: () => {
      return api.users
        .usersControllerGetUserInfoByUserId(userId)
        .then(({ data }) => data);
    },
  });
};

export default useProfileByUserIdQuery;
