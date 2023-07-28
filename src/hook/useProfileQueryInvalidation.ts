import { useQueryClient } from "@tanstack/react-query";
import useUsersControllerGetUserInfoQuery, {
  QUERY_KEY as usersControllerGetUserInfoQueryKey,
} from "@/queries/useUsersControllerGetUserInfoQuery";
import { QUERY_KEY as usersControllerGetUserInfoByUserIdQueryKey } from "@/queries/useUsersControllerGetUserInfoByUserIdQuery";

export default function useProfileQueryInvalidation(
  userId: string | undefined
) {
  const { data: myProfile, isSuccess: isMyProfileQuerySuccess } =
    useUsersControllerGetUserInfoQuery();
  const queryClient = useQueryClient();

  const invalidate = () => {
    if (!isMyProfileQuerySuccess || userId == null) {
      return;
    }

    if (myProfile.id === userId) {
      queryClient.invalidateQueries({
        queryKey: [usersControllerGetUserInfoQueryKey],
      });
    }

    queryClient.invalidateQueries({
      queryKey: [usersControllerGetUserInfoByUserIdQueryKey, userId],
    });
  };

  return invalidate;
}
