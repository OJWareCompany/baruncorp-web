import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { UserResponseDto } from "@/api";

const useUserQuery = ({
  userId,
  initialData,
}: {
  userId: string;
  initialData?: UserResponseDto | null;
}) => {
  const api = useApi();

  return useQuery<UserResponseDto, AxiosError<ErrorResponseData>>({
    queryKey: ["users", "detail", userId],
    queryFn: () =>
      api.users
        .usersControllerGetUserInfoByUserId(userId)
        .then(({ data }) => data),
    enabled: userId !== "",
    initialData: initialData == null ? undefined : initialData,
  });
};

export default useUserQuery;
