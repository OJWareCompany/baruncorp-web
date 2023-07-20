import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApiClient from "@/hook/useApiClient";
import { UserLicensePostReqDto } from "@/types/dto/departments";
import useProfileQueryInvalidation from "@/hook/useProfileQueryInvalidation";

const usePostUserLicenseMutation = (userId: string | undefined) => {
  const apiClient = useApiClient();
  const invalidate = useProfileQueryInvalidation(userId);

  return useMutation<
    void,
    AxiosError<ErrorResponseData>,
    Omit<UserLicensePostReqDto, "userId">
  >(
    (variables) => {
      if (userId == null) {
        return Promise.reject("userId is undefined.");
      }

      const data: UserLicensePostReqDto = {
        userId,
        ...variables,
      };

      return apiClient
        .post<void>("/departments/licenses", data)
        .then(({ data }) => data);
    },
    {
      onSuccess: () => invalidate(),
    }
  );
};

export default usePostUserLicenseMutation;
