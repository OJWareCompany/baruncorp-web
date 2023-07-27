import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { UserServicePostReqDto } from "@/types/dto/departments";
import useProfileQueryInvalidation from "@/hook/useProfileQueryInvalidation";

const usePostUserServiceMutation = (userId: string | undefined) => {
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

      return api
        .post<void>("/departments/member-services", data)
        .then(({ data }) => data);
    },
    {
      onSuccess: () => invalidate(),
    }
  );
};

export default usePostUserServiceMutation;
