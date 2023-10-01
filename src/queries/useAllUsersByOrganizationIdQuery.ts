import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { UserResponseDto } from "@/api";

const useAllUsersByOrganizationIdQuery = (organizationId: string) => {
  const api = useApi();

  return useQuery<UserResponseDto[], AxiosError<ErrorResponseData>>({
    queryKey: ["users", "list", { organizationId }],
    queryFn: () =>
      api.users
        .findUsersHttpControllerGetFindUsers({
          organizationId,
          limit: Number.MAX_SAFE_INTEGER,
        })
        .then(({ data }) => data.items),
    enabled: organizationId !== "",
  });
};

export default useAllUsersByOrganizationIdQuery;
