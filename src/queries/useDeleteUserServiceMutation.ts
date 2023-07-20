import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApiClient from "@/hook/useApiClient";
import { UserServiceDeleteReqDto } from "@/types/dto/departments";
import useProfileQueryInvalidation from "@/hook/useProfileQueryInvalidation";

const useDeleteUserServiceMutation = (userId: string | undefined) => {
  const apiClient = useApiClient();
  const invalidate = useProfileQueryInvalidation();

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

      return apiClient
        .delete<void>("/departments/member-services", {
          params,
        })
        .then(({ data }) => data);
    },
    {
      onSuccess: () => invalidate(userId),
    }
  );
};

export default useDeleteUserServiceMutation;
