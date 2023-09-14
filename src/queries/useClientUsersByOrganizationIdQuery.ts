import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { UserResponseDto } from "@/api";

const useUsersByOrganizationIdQuery = (organizationId: string) => {
  const api = useApi();

  return useQuery<UserResponseDto[], AxiosError<ErrorResponseData>>({
    queryKey: ["users", "list", { organizationId }],
    queryFn: () =>
      api.users
        .findUsersHttpControllerGetFindUsers({ organizationId, email: null })
        .then(({ data }) => data),
  });
};

export default useUsersByOrganizationIdQuery;
