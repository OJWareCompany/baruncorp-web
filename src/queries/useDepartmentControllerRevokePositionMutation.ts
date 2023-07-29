import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { UserPositionDeleteReqDto } from "@/types/dto/departments"; // TODO: remove
import useProfileQueryInvalidation from "@/hook/useProfileQueryInvalidation";

const useDepartmentControllerRevokePositionMutation = (
  userId: string | undefined
) => {
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

      return api.departments
        .departmentControllerRevokePosition(params)
        .then(({ data }) => data);
    },
    {
      onSuccess: () => invalidate(),
    }
  );
};

export default useDepartmentControllerRevokePositionMutation;
