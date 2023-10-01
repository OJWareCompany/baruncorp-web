import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { OrganizationResponseDto } from "@/api";

const useOrganizationQuery = ({
  organizationId,
  initialData,
}: {
  organizationId: string;
  initialData?: OrganizationResponseDto | null;
}) => {
  const api = useApi();

  return useQuery<OrganizationResponseDto, AxiosError<ErrorResponseData>>({
    queryKey: ["organizations", "detail", organizationId],
    queryFn: () =>
      api.organizations
        .findOrganizationHttpControllerGet(organizationId)
        .then(({ data }) => data),
    enabled: organizationId !== "",
    initialData: initialData == null ? undefined : initialData,
  });
};

export default useOrganizationQuery;
