import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useProfileQuery, {
  QUERY_KEY as profileQueryKey,
} from "./useProfileQuery";
import useApiClient from "@/hook/useApiClient";
import { UserLicensePostReqDto } from "@/types/dto/departments";

const usePostUserLicenseMutation = (userId: string | undefined) => {
  const apiClient = useApiClient();
  const { data: myProfile, isSuccess: isMyProfileQuerySuccess } =
    useProfileQuery();
  const queryClient = useQueryClient();

  return useMutation<
    void,
    AxiosError<ErrorResponseData>,
    Omit<UserLicensePostReqDto, "userId">
  >(
    (variables) => {
      if (userId == null) {
        return Promise.reject("userId should not be undefined.");
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

export default usePostUserLicenseMutation;
