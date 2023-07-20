import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApiClient from "@/hook/useApiClient";
import { UserLicenseDeleteReqDto } from "@/types/dto/departments";
import useProfileQueryInvalidation from "@/hook/useProfileQueryInvalidation";

const useDeleteUserLicenseMutation = (userId: string | undefined) => {
  const apiClient = useApiClient();
  const invalidate = useProfileQueryInvalidation();

  return useMutation<
    void,
    AxiosError<ErrorResponseData>,
    Pick<UserLicenseDeleteReqDto, "type" | "issuingCountryName">
  >(
    ({ type, issuingCountryName }) => {
      if (userId == null) {
        return Promise.reject("userId is undefined.");
      }

      const params: UserLicenseDeleteReqDto = {
        userId,
        type,
        issuingCountryName,
      };

      return apiClient
        .delete<void>("/departments/licenses", {
          params,
        })
        .then(({ data }) => data);
    },
    {
      onSuccess: () => invalidate(userId),
    }
  );
};

export default useDeleteUserLicenseMutation;
