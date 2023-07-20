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
  });
};

export default useOrganizationsQuery;
