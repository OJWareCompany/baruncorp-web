import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { ProfilePatchReqDto, ProfilePatchResDto } from "@/types/dto/users";
import useApiClient from "@/hook/useApiClient";
import useProfileQueryInvalidation from "@/hook/useProfileQueryInvalidation";

const usePatchProfileMutation = (userId: string | undefined) => {
  const apiClient = useApiClient();
  const invalidate = useProfileQueryInvalidation();

  return useMutation<
    ProfilePatchResDto,
    AxiosError<ErrorResponseData>,
    ProfilePatchReqDto
  >(
    (data) => {
      if (userId == null) {
        return Promise.reject("userId is undefined.");
      }

      return apiClient
        .patch<ProfilePatchResDto>(`/users/profile/${userId}`, data)
        .then(({ data }) => data);
    },
    {
      onSuccess: () => invalidate(userId),
    }
  );
};

export default usePatchProfileMutation;
