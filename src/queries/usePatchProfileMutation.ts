import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { AxiosError, AxiosResponse } from "axios";
import { QUERY_KEY as profileQueryKey } from "./useProfileQuery";
import apiClient from "@/api";
import { ProfilePatchReqDto } from "@/types/dto/users";

const usePatchProfileMutation = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation<
    AxiosResponse<any>,
    AxiosError<ErrorResponseData>,
    ProfilePatchReqDto
  >(
    (data) =>
      apiClient.patch("/users/profile", data, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
          "Content-Type": "application/json",
        },
      }),
    {
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: [profileQueryKey] }),
    }
  );
};

export default usePatchProfileMutation;
