import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { UserLicenseDeleteReqDto } from "@/types/dto/departments";
import useProfileQueryInvalidation from "@/hook/useProfileQueryInvalidation";

const useUsersControllerDeleteLicenseMutation = (
  userId: string | undefined
) => {
  const api = useApi();
  const invalidate = useProfileQueryInvalidation(userId);

  return useMutation<
    void,
    AxiosError<ErrorResponseData>,
    Pick<UserLicenseDeleteReqDto, "type" | "issuingCountryName">
  >(
    ({ type, issuingCountryName }) => {
      if (userId == null) {
        return Promise.reject("userId is undefined.");
      }

      const params = {
        userId,
        type,
        issuingCountryName,
      };

      return api.users
        .usersControllerDeleteLicense(params)
        .then(({ data }) => data);
    },
    {
      onSuccess: () => invalidate(),
    }
  );
};

export default useUsersControllerDeleteLicenseMutation;
