import { useQueryClient } from "@tanstack/react-query";
import useProfileQuery, {
  QUERY_KEY as profileQueryKey,
} from "@/queries/useProfileQuery";

export default function useProfileQueryInvalidation() {
  const { data: myProfile, isSuccess: isMyProfileQuerySuccess } =
    useProfileQuery();
  const queryClient = useQueryClient();

  const invalidate = (userId: string | undefined) => {
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
