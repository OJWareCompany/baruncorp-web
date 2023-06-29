import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { ProfileGetResDto } from "@/types/dto/users";
import useApiClient from "@/hook/useApiClient";

export const QUERY_KEY = "profile";

const useProfileQuery = () => {
  const apiClient = useApiClient();

  return useQuery<ProfileGetResDto, AxiosError<ErrorResponseData>>({
    queryKey: [QUERY_KEY],
    queryFn: () =>
      apiClient
        .get<ProfileGetResDto>("/users/profile")
        .then(({ data }) => data),
    refetchOnWindowFocus: false, // TODO: 이후에 모든 query에 적용할지 논의 필요
  });
};

export default useProfileQuery;
