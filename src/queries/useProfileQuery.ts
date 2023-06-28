import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useSession } from "next-auth/react";
import { ProfileGetResDto } from "@/types/dto/users";
import apiClient from "@/api";

export const QUERY_KEY = "profile";

const useProfileQuery = () => {
  const { data: session } = useSession();

  return useQuery<ProfileGetResDto, AxiosError<ErrorResponseData>>({
    queryKey: [QUERY_KEY, session?.accessToken, session?.isValid],
    queryFn: () =>
      apiClient
        .get<ProfileGetResDto>("/users/profile", {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        })
        .then(({ data }) => data),
    refetchOnWindowFocus: false, // TODO: 이후에 모든 query에 적용할지 논의 필요
    enabled: session?.accessToken != null && session.isValid,
  });
};

export default useProfileQuery;
