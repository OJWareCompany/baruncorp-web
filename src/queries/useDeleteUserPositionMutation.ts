import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { UserPositionDeleteReqDto } from "@/types/dto/departments";
import useProfileQueryInvalidation from "@/hook/useProfileQueryInvalidation";

const useDeleteUserPositionMutation = (userId: string | undefined) => {
  const api = useApi();
  const invalidate = useProfileQueryInvalidation(userId);

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

      return api
        .delete<void>("/departments/user-position", {
          params,
        })
        .then(({ data }) => data);
    },
    {
      onSuccess: () => invalidate(),
    }
  );
};

export default useDeleteUserPositionMutation;
