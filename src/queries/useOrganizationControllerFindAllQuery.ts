import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { OrganizationResponseDto } from "@/api";

export const QUERY_KEY = "organizationControllerFindAll";

const useOrganizationControllerFindAllQuery = () => {
  const api = useApi();

  return useQuery<OrganizationResponseDto[], AxiosError<ErrorResponseData>>({
    queryKey: [QUERY_KEY],
    queryFn: () =>
      api.organizations
        .organizationControllerFindAll()
        .then(({ data }) => data),
  });
};

export default useOrganizationControllerFindAllQuery;
