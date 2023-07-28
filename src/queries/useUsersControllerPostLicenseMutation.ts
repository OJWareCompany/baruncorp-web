import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import useProfileQueryInvalidation from "@/hook/useProfileQueryInvalidation";
import { CreateLicenseRequestDto } from "@/api";

const useUsersControllerPostLicenseMutation = (userId: string | undefined) => {
  const api = useApi();
  const invalidate = useProfileQueryInvalidation(userId);

  return useMutation<
    void,
    AxiosError<ErrorResponseData>,
    Omit<CreateLicenseRequestDto, "userId">
  >(
    (variables) => {
      if (userId == null) {
        return Promise.reject("userId is undefined.");
      }

      const data: CreateLicenseRequestDto = {
        userId,
        ...variables,
      };

      return api.users
        .usersControllerPostLicense(data)
        .then(({ data }) => data);
    },
    {
      onSuccess: () => invalidate(),
    }
  );
};

export default useUsersControllerPostLicenseMutation;
