import { useQueryClient } from "@tanstack/react-query";
import useProfileQuery, {
  QUERY_KEY as profileQueryKey,
} from "@/queries/useProfileQuery";

export default function useProfileByUserIdQueryInvalidation(
  userId: string | undefined
) {
  const { data: myProfile, isSuccess: isMyProfileQuerySuccess } =
    useProfileQuery();
  const queryClient = useQueryClient();

  const invalidate = () => {
    if (!isMyProfileQuerySuccess || userId == null) {
      return;
    }

    if (myProfile.id === userId) {
      queryClient.invalidateQueries({
        queryKey: [profileQueryKey],
      });
    }

    queryClient.invalidateQueries({
      queryKey: [profileQueryKey, userId],
    });
  };

  return invalidate;
}
