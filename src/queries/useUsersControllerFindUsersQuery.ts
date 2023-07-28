import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { UserResponseDto } from "@/api";

export const QUERY_KEY = "usersControllerFindUsers";

const useUsersControllerFindUsersQuery = () => {
  const api = useApi();

  return useQuery<UserResponseDto[], AxiosError<ErrorResponseData>>({
    queryKey: [QUERY_KEY],
    queryFn: () =>
      api.users.usersControllerFindUsers().then(({ data }) => data),
  });
};

export default useUsersControllerFindUsersQuery;
