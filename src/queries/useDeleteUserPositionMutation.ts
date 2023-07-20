import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApiClient from "@/hook/useApiClient";
import { UserPositionDeleteReqDto } from "@/types/dto/departments";
import useProfileQueryInvalidation from "@/hook/useProfileQueryInvalidation";

const useDeleteUserPositionMutation = (userId: string | undefined) => {
  const apiClient = useApiClient();
  const invalidate = useProfileQueryInvalidation();

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
      onSuccess: () => invalidate(userId),
    }
  );
};

export default useDeleteUserPositionMutation;
