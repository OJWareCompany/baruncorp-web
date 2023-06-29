import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { QUERY_KEY as profileQueryKey } from "./useProfileQuery";
import { ProfilePatchReqDto, ProfilePatchResDto } from "@/types/dto/users";
import useApiClient from "@/hook/useApiClient";

const usePatchProfileMutation = () => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation<
    ProfilePatchResDto,
    AxiosError<ErrorResponseData>,
    ProfilePatchReqDto
  >(
    (data) =>
      apiClient
        .patch<ProfilePatchResDto>("/users/profile", data)
        .then(({ data }) => data),
    {
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: [profileQueryKey] }),
    }
  );
};

export default usePatchProfileMutation;
