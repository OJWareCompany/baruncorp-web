import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useParams } from "next/navigation";
import { ProfileGetResDto } from "@/types/dto/users";
import useApi from "@/hook/useApi";

export const QUERY_KEY = "profile";

const useProfileQuery = (userId?: string) => {
  const api = useApi();

  return useQuery<ProfileGetResDto, AxiosError<ErrorResponseData>>({
    queryKey: [QUERY_KEY, userId ?? "mine"],
    queryFn: () =>
      api
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
