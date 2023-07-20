import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApiClient from "@/hook/useApiClient";
import { UserServicePostReqDto } from "@/types/dto/departments";
import useProfileQueryInvalidation from "@/hook/useProfileQueryInvalidation";

const usePostUserServiceMutation = (userId: string | undefined) => {
  const apiClient = useApiClient();
  const invalidate = useProfileQueryInvalidation();

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

      return apiClient
        .post<void>("/departments/member-services", data)
        .then(({ data }) => data);
    },
    {
      onSuccess: () => invalidate(userId),
    }
  );
};

export default usePostUserServiceMutation;
