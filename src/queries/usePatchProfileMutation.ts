import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { Session } from "next-auth";
import { QUERY_KEY as profileQueryKey } from "./useProfileQuery";
import apiClient from "@/api";
import { ProfilePatchReqDto, ProfilePatchResDto } from "@/types/dto/users";

const usePatchProfileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ProfilePatchResDto,
    AxiosError<ErrorResponseData>,
    ProfilePatchReqDto
  >(
    async (data) => {
      const {
        data: { accessToken },
      } = await axios.get<Session>("/api/auth/session");

      return apiClient
        .patch<ProfilePatchResDto>("/users/profile", data, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        })
        .then(({ data }) => data);
    },
    {
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: [profileQueryKey] }),
    }
  );
};

export default usePatchProfileMutation;
