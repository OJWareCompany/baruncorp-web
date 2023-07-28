import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEY as usersControllerGetUserInfoQueryKey } from "@/queries/useUsersControllerGetUserInfoQuery";

export default function useUsersControllerGetUserInfoQueryInvalidation() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({
      queryKey: [usersControllerGetUserInfoQueryKey],
    });
  };

  return invalidate;
}
