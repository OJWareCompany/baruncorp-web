import { useQueryClient } from "@tanstack/react-query";
import useProfileQuery, {
  QUERY_KEY as profileQueryKey,
} from "@/queries/useProfileQuery";

export default function useProfileQueryInvalidation(
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
        queryKey: [profileQueryKey, "mine"],
      });
    }

    queryClient.invalidateQueries({ queryKey: [profileQueryKey, userId] });
  };

  return invalidate;
}
