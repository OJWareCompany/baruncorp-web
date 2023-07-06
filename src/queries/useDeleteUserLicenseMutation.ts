import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useProfileQuery, {
  QUERY_KEY as profileQueryKey,
} from "./useProfileQuery";
import useApiClient from "@/hook/useApiClient";
import { UserLicenseDeleteReqDto } from "@/types/dto/departments";

const useDeleteUserLicenseMutation = (userId: string | undefined) => {
  const apiClient = useApiClient();
  const { data: myProfile, isSuccess: isMyProfileQuerySuccess } =
    useProfileQuery();
  const queryClient = useQueryClient();

  return useMutation<
    void,
    AxiosError<ErrorResponseData>,
    Pick<UserLicenseDeleteReqDto, "type" | "issuingCountryName">
  >(
    ({ type, issuingCountryName }) => {
      if (userId == null) {
        return Promise.reject("userId should not be undefined.");
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
      onSuccess: () => {
        if (!isMyProfileQuerySuccess || userId == null) {
          return;
        }

        if (myProfile.id === userId) {
          queryClient.invalidateQueries({
            queryKey: [profileQueryKey, "mine"],
          });
        }

        queryClient.invalidateQueries({ queryKey: [profileQueryKey, userId] });
      },
    }
  );
};

export default useDeleteUserLicenseMutation;
