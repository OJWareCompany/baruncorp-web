import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { UserServicePostReqDto } from "@/types/dto/departments"; // TODO: remove
import useProfileQueryInvalidation from "@/hook/useProfileQueryInvalidation";

const useDepartmentControllerPutMemberInChageOfTheServiceMutation = (
  userId: string | undefined
) => {
  const api = useApi();
  const invalidate = useProfileQueryInvalidation(userId);

  return useMutation<
    void,
    AxiosError<ErrorResponseData>,
    UserServicePostReqDto["serviceId"]
  >(
    (serviceId) => {
      if (userId == null) {
        return Promise.reject("userId is undefined.");
      }

      const data: UserServicePostReqDto = {
        userId,
        serviceId,
      };

      return api.departments
        .departmentControllerPutMemberInChageOfTheService(data)
        .then(({ data }) => data);
    },
    {
      onSuccess: () => invalidate(),
    }
  );
};

export default useDepartmentControllerPutMemberInChageOfTheServiceMutation;
