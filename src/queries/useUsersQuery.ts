import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import {
  FindUsersHttpControllerGetFindUsersParams,
  UserPaginatedResponseDto,
} from "@/api/api-spec";

export const getUsersQueryKey = (
  params: FindUsersHttpControllerGetFindUsersParams
) => ["users", "list", params];

const useUsersQuery = (
  params: FindUsersHttpControllerGetFindUsersParams,
  isKeepPreviousData?: boolean
) => {
  const api = useApi();

  return useQuery<UserPaginatedResponseDto, AxiosError<ErrorResponseData>>({
    queryKey: getUsersQueryKey(params),
    queryFn: () =>
      api.users
        .findUsersHttpControllerGetFindUsers(params)
        .then(({ data }) => data),
    placeholderData: isKeepPreviousData ? keepPreviousData : undefined,
  });
};

export default useUsersQuery;
