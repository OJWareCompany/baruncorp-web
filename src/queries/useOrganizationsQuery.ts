import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { OrganizationsGetResDto } from "@/types/dto/organizations";
import useApiClient from "@/hook/useApiClient";

export const QUERY_KEY = "organizations";

const useOrganizationsQuery = () => {
  const apiClient = useApiClient();

  return useQuery<OrganizationsGetResDto, AxiosError<ErrorResponseData>>({
    queryKey: [QUERY_KEY],
    queryFn: () =>
      apiClient
        .get<OrganizationsGetResDto>("/organizations")
        .then(({ data }) => data),
    refetchOnWindowFocus: false, // TODO: 이후에 모든 query에 적용할지 논의 필요
  });
};

export default useOrganizationsQuery;
