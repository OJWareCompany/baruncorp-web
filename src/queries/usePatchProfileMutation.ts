import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { ProfilePatchReqDto, ProfilePatchResDto } from "@/types/dto/users";
import useApi from "@/hook/useApi";
import useProfileQueryInvalidation from "@/hook/useProfileQueryInvalidation";

const usePatchProfileMutation = (userId: string | undefined) => {
  const api = useApi();
  const invalidate = useProfileQueryInvalidation(userId);

  return useMutation<
    ProfilePatchResDto,
    AxiosError<ErrorResponseData>,
    ProfilePatchReqDto
  >(
    (data) => {
      if (userId == null) {
        return Promise.reject("userId is undefined.");
      }

      return api
        .patch<ProfilePatchResDto>(`/users/profile/${userId}`, data)
        .then(({ data }) => data);
    },
    {
      onSuccess: () => invalidate(),
    }
  );
};

export default usePatchProfileMutation;
