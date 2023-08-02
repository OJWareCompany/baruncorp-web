import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import useProfileByUserIdQueryInvalidation from "@/hook/useProfileByUserIdQueryInvalidation";
import { CreateMemberInChargeOfTheServiceRequestDto } from "@/api";

const usePostMemberServiceMutation = (userId: string | undefined) => {
  const api = useApi();
  const invalidate = useProfileByUserIdQueryInvalidation(userId);

  return useMutation<
    void,
    AxiosError<ErrorResponseData>,
    CreateMemberInChargeOfTheServiceRequestDto["serviceId"]
  >(
    (serviceId) => {
      if (userId == null) {
        return Promise.reject("userId is undefined.");
      }

      const data: CreateMemberInChargeOfTheServiceRequestDto = {
        userId,
        serviceId,
      };

      return api.departments
        .departmentControllerPostPutMemberInChageOfTheService(data)
        .then(({ data }) => data);
    },
    {
      onSuccess: () => invalidate(),
    }
  );
};

export default usePostMemberServiceMutation;
