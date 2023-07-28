import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { UserPositionPostReqDto } from "@/types/dto/departments";
import useProfileQueryInvalidation from "@/hook/useProfileQueryInvalidation";

const useDepartmentControllerAppointPositionMutation = (
  userId: string | undefined
) => {
  const api = useApi();
  const invalidate = useProfileQueryInvalidation(userId);

  return useMutation<
    void,
    AxiosError<ErrorResponseData>,
    UserPositionPostReqDto["positionId"]
  >(
    (positionId) => {
      if (userId == null) {
        return Promise.reject("userId is undefined.");
      }

      const params: UserPositionPostReqDto = {
        userId,
        positionId,
      };

      return api.departments
        .departmentControllerAppointPosition(params)
        .then(({ data }) => data);
    },
    {
      onSuccess: () => invalidate(),
    }
  );
};

export default useDepartmentControllerAppointPositionMutation;
