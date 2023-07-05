import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useProfileQuery, {
  QUERY_KEY as profileQueryKey,
} from "./useProfileQuery";
import { ProfilePatchReqDto, ProfilePatchResDto } from "@/types/dto/users";
import useApiClient from "@/hook/useApiClient";

const usePatchProfileMutation = (userId: string | undefined) => {
  const apiClient = useApiClient();
  const { data: myProfile, isSuccess: isMyProfileQuerySuccess } =
    useProfileQuery();
  const queryClient = useQueryClient();

  return useMutation<
    ProfilePatchResDto,
    AxiosError<ErrorResponseData>,
    ProfilePatchReqDto
  >(
    (data) =>
      userId == null
        ? Promise.reject("userId should not be undefined.")
        : apiClient
            .patch<ProfilePatchResDto>(`/users/profile/${userId}`, data)
            .then(({ data }) => data),
    {
      onSuccess: () => {
        if (!isMyProfileQuerySuccess) {
          return;
        }

        if (myProfile.id === userId) {
          queryClient.invalidateQueries({
            queryKey: [profileQueryKey],
            exact: true,
          });
        }

        queryClient.invalidateQueries({
          queryKey: [profileQueryKey, userId],
        });
      },
    }
  );
};

export default usePatchProfileMutation;
