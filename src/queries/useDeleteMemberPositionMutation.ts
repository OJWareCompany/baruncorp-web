import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { QUERY_KEY as profileQueryKey } from "./useProfileQuery";
import useApiClient from "@/hook/useApiClient";
import { UserPositionDeleteReqDto } from "@/types/dto/departments";

const useDeleteMemberPositionMutation = (userId: string) => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation<
    void,
    AxiosError<ErrorResponseData>,
    UserPositionDeleteReqDto["positionId"]
  >(
    (positionId) => {
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
        queryClient.invalidateQueries({ queryKey: [profileQueryKey, userId] });
      },
    }
  );
};

export default useDeleteMemberPositionMutation;
