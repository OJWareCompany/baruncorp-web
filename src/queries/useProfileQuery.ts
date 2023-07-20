import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useParams } from "next/navigation";
import { ProfileGetResDto } from "@/types/dto/users";
import useApiClient from "@/hook/useApiClient";

export const QUERY_KEY = "profile";

const useProfileQuery = (userId?: string) => {
  const apiClient = useApiClient();

  return useQuery<ProfileGetResDto, AxiosError<ErrorResponseData>>({
    queryKey: [QUERY_KEY, userId ?? "mine"],
    queryFn: () =>
      apiClient
        .get<ProfileGetResDto>(
          userId ? `/users/profile/${userId}` : "/users/profile"
        )
        .then(({ data }) => data),
  });
};

export default useProfileQuery;

export const useProfileQueryWithParams = () => {
  const { userId } = useParams() as { userId: string | undefined };

  return useProfileQuery(userId);
};
