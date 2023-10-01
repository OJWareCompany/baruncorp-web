import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { UserResponseDto } from "@/api";

const useProfileQuery = (initialData?: UserResponseDto | null) => {
  const api = useApi();

  return useQuery<UserResponseDto, AxiosError<ErrorResponseData>>({
    queryKey: ["profile"],
    queryFn: () =>
      api.users.usersControllerGetUserInfo().then(({ data }) => data),
    initialData: initialData == null ? undefined : initialData,
  });
};

export default useProfileQuery;
