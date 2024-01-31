import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { OrganizationResponseDto } from "@/api/api-spec";

export const getOrganizationQueryKey = (organizationId: string) => [
  "organizations",
  "detail",
  organizationId,
];

const useOrganizationQuery = (organizationId: string) => {
  const api = useApi();

  return useQuery<OrganizationResponseDto, AxiosError<ErrorResponseData>>({
    queryKey: getOrganizationQueryKey(organizationId),
    queryFn: () =>
      api.organizations
        .findOrganizationHttpControllerGet(organizationId)
        .then(({ data }) => data),
    enabled: organizationId !== "",
  });
};

export default useOrganizationQuery;
