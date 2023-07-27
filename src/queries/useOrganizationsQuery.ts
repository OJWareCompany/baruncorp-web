import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { OrganizationsGetResDto } from "@/types/dto/organizations";
import useApi from "@/hook/useApi";

export const QUERY_KEY = "organizations";

const useOrganizationsQuery = () => {
  const api = useApi();

  return useQuery<OrganizationsGetResDto, AxiosError<ErrorResponseData>>({
    queryKey: [QUERY_KEY],
    queryFn: () =>
      api
        .get<OrganizationsGetResDto>("/organizations")
        .then(({ data }) => data),
  });
};

export default useOrganizationsQuery;
