import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { QUERY_KEY as profileQueryKey } from "./useProfileQuery";
import useApiClient from "@/hook/useApiClient";
import { UserPositionPostReqDto } from "@/types/dto/departments";

const usePostMemberPositionMutation = (userId: string) => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation<
    void,
    AxiosError<ErrorResponseData>,
    UserPositionPostReqDto["positionId"]
  >(
    (positionId) => {
      const params: UserPositionPostReqDto = {
        userId,
        positionId,
      };

      return apiClient
        .post<void>("/departments/user-position", {}, { params })
        .then(({ data }) => data);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [profileQueryKey, userId] });
      },
    }
  );
};

export default usePostMemberPositionMutation;
