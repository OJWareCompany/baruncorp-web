import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useProfileQuery, {
  QUERY_KEY as profileQueryKey,
} from "./useProfileQuery";
import useApiClient from "@/hook/useApiClient";
import { UserPositionDeleteReqDto } from "@/types/dto/departments";

const useDeleteUserPositionMutation = (userId: string | undefined) => {
  const apiClient = useApiClient();
  const { data: myProfile, isSuccess: isMyProfileQuerySuccess } =
    useProfileQuery();
  const queryClient = useQueryClient();

  return useMutation<
    void,
    AxiosError<ErrorResponseData>,
    UserPositionDeleteReqDto["positionId"] | null
  >(
    (positionId) => {
      if (userId == null || positionId == null) {
        return Promise.reject("userId or positionId is undefined.");
      }

      const params: UserPositionDeleteReqDto = {
        userId,
        positionId,
      };

      return apiClient
        .delete<void>("/departments/user-position", {
          params,
        })
        .then(({ data }) => data);
    },
    {
      onSuccess: () => {
        if (!isMyProfileQuerySuccess || userId == null) {
          return;
        }

        if (myProfile.id === userId) {
          queryClient.invalidateQueries({
            queryKey: [profileQueryKey, "mine"],
          });
        }

        queryClient.invalidateQueries({ queryKey: [profileQueryKey, userId] });
      },
    }
  );
};

export default useDeleteUserPositionMutation;
