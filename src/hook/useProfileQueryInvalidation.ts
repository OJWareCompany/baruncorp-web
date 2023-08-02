import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEY as profileQueryKey } from "@/queries/useProfileQuery";

export default function useProfileQueryInvalidation() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({
      queryKey: [profileQueryKey],
    });
  };

  return invalidate;
}
