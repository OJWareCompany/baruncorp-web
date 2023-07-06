import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { QUERY_KEY as profileQueryKey } from "./useProfileQuery";
import useApiClient from "@/hook/useApiClient";
import { UserLicensePostReqDto } from "@/types/dto/departments";

const usePostUserLicenseMutation = (userId: string) => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation<
    void,
    AxiosError<ErrorResponseData>,
    Omit<UserLicensePostReqDto, "userId">
  >(
    (variables) => {
      const data: UserLicensePostReqDto = {
        userId,
        ...variables,
      };

      return apiClient
        .post<void>("/departments/licenses", data)
        .then(({ data }) => data);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [profileQueryKey, userId] });
      },
    }
  );
};

export default usePostUserLicenseMutation;
