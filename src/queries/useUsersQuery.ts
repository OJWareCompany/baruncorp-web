import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { UsersGetResDto } from "@/types/dto/users";

export const QUERY_KEY = "members";

const useUsersQuery = () => {
  const api = useApi();

  return useQuery<UsersGetResDto, AxiosError<ErrorResponseData>>({
    queryKey: [QUERY_KEY],
    queryFn: () => api.get<UsersGetResDto>("/users").then(({ data }) => data),
  });
};

export default useUsersQuery;
