import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApiClient from "@/hook/useApiClient";
import { UsersGetResDto } from "@/types/dto/users";

export const QUERY_KEY = "members";

const useUsersQuery = () => {
  const apiClient = useApiClient();

  return useQuery<UsersGetResDto, AxiosError<ErrorResponseData>>({
    queryKey: [QUERY_KEY],
    queryFn: () =>
      apiClient.get<UsersGetResDto>("/users").then(({ data }) => data),
    refetchOnWindowFocus: false, // TODO: 이후에 모든 query에 적용할지 논의 필요
  });
};

export default useUsersQuery;
