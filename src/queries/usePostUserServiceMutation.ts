import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useProfileQuery, {
  QUERY_KEY as profileQueryKey,
} from "./useProfileQuery";
import useApiClient from "@/hook/useApiClient";
import { UserServicePostReqDto } from "@/types/dto/departments";

const usePostUserServiceMutation = (userId: string | undefined) => {
  const apiClient = useApiClient();
  const { data: myProfile, isSuccess: isMyProfileQuerySuccess } =
    useProfileQuery();
  const queryClient = useQueryClient();

  return useMutation<
    void,
    AxiosError<ErrorResponseData>,
    UserServicePostReqDto["serviceId"]
  >(
    (serviceId) => {
      if (userId == null) {
        return Promise.reject("userId is undefined.");
      }

      const data: UserServicePostReqDto = {
        userId,
        serviceId,
      };

      return apiClient
        .post<void>("/departments/member-services", data)
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

export default usePostUserServiceMutation;
