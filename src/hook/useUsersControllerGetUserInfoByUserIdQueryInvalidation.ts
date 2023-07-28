import { useQueryClient } from "@tanstack/react-query";
import useUsersControllerGetUserInfoQuery, {
  QUERY_KEY as usersControllerGetUserInfoByUserIdQueryKey,
} from "@/queries/useUsersControllerGetUserInfoByUserIdQuery";

export default function useUsersControllerGetUserInfoByUserIdQueryInvalidation(
  userId: string | undefined
) {
  const queryClient = useQueryClient();

  const invalidate = () => {
    if (userId == null) {
      return Promise.reject("userId is undefined.");
    }
    queryClient.invalidateQueries({
      queryKey: [usersControllerGetUserInfoByUserIdQueryKey, userId],
    });
  };

  return invalidate;
}
