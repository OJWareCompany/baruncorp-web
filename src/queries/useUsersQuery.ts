import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import {
  FindUsersHttpControllerGetFindUsersParams,
  UserPaginatedResponseDto,
} from "@/api";

export const getUsersQueryKey = (
  params: FindUsersHttpControllerGetFindUsersParams
) => ["users", "list", params];

const useUsersQuery = (params: FindUsersHttpControllerGetFindUsersParams) => {
  const api = useApi();

  return useQuery<UserPaginatedResponseDto, AxiosError<ErrorResponseData>>({
    queryKey: getUsersQueryKey(params),
    queryFn: () =>
      api.users
        .findUsersHttpControllerGetFindUsers(params)
        .then(({ data }) => data),
    keepPreviousData: true,
  });
};

export default useUsersQuery;
