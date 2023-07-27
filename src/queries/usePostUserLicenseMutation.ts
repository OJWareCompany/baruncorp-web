import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { UserLicensePostReqDto } from "@/types/dto/departments";
import useProfileQueryInvalidation from "@/hook/useProfileQueryInvalidation";

const usePostUserLicenseMutation = (userId: string | undefined) => {
  const api = useApi();
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

      return api
        .post<void>("/departments/licenses", data)
        .then(({ data }) => data);
    },
    {
      onSuccess: () => invalidate(),
    }
  );
};

export default usePostUserLicenseMutation;
