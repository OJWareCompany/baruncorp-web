import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { UserServiceDeleteReqDto } from "@/types/dto/departments"; // TODO: remove
import useProfileQueryInvalidation from "@/hook/useProfileQueryInvalidation";

const useDepartmentControllerTerminateServiceMemberIsInChargeOfMutation = (
  userId: string | undefined
) => {
  const api = useApi();
  const invalidate = useProfileQueryInvalidation(userId);

  return useMutation<
    void,
    AxiosError<ErrorResponseData>,
    UserServiceDeleteReqDto["serviceId"]
  >(
    (serviceId) => {
      if (userId == null) {
        return Promise.reject("userId is undefined.");
      }

      const params: UserServiceDeleteReqDto = {
        userId,
        serviceId,
      };

      return api.departments
        .departmentControllerTerminateServiceMemberIsInChargeOf(params)
        .then(({ data }) => data);
    },
    {
      onSuccess: () => invalidate(),
    }
  );
};

export default useDepartmentControllerTerminateServiceMemberIsInChargeOfMutation;
