import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { UserPaginatedResopnseDto } from "@/api";

const useAllUsersByOrganizationIdQuery = (organizationId: string) => {
  const api = useApi();

  return useQuery<UserPaginatedResopnseDto, AxiosError<ErrorResponseData>>({
    queryKey: ["users", "list", "all", { organizationId }],
    queryFn: () =>
      api.users
        .findUsersHttpControllerGetFindUsers({
          organizationId,
          limit: Number.MAX_SAFE_INTEGER,
        })
        .then(({ data }) => data),
    enabled: organizationId !== "",
  });
};

export default useAllUsersByOrganizationIdQuery;
