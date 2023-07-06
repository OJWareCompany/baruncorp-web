import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { QUERY_KEY as profileQueryKey } from "./useProfileQuery";
import useApiClient from "@/hook/useApiClient";
import { UserLicenseDeleteReqDto } from "@/types/dto/departments";

const useDeleteUserLicenseMutation = (userId: string) => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation<
    void,
    AxiosError<ErrorResponseData>,
    Pick<UserLicenseDeleteReqDto, "type" | "issuingCountryName">
  >(
    ({ type, issuingCountryName }) => {
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
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [profileQueryKey, userId] });
      },
    }
  );
};

export default useDeleteUserLicenseMutation;
