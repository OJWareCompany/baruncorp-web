import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { MembersGetResDto } from "@/types/dto/organizations";
import useApiClient from "@/hook/useApiClient";

export const QUERY_KEY = "members";

const useMembersQuery = () => {
  const apiClient = useApiClient();

  return useQuery<MembersGetResDto, AxiosError<ErrorResponseData>>({
    queryKey: [QUERY_KEY],
    queryFn: () =>
      apiClient
        .get<MembersGetResDto>("/organizations/members")
        .then(({ data }) => data),
    refetchOnWindowFocus: false, // TODO: 이후에 모든 query에 적용할지 논의 필요
  });
};

export default useMembersQuery;
