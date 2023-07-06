import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { QUERY_KEY as profileQueryKey } from "./useProfileQuery";
import useApiClient from "@/hook/useApiClient";
import { UserServicePostReqDto } from "@/types/dto/departments";

const usePostUserServiceMutation = (userId: string) => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation<
    void,
    AxiosError<ErrorResponseData>,
    UserServicePostReqDto["serviceId"]
  >(
    (serviceId) => {
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
        queryClient.invalidateQueries({ queryKey: [profileQueryKey, userId] });
      },
    }
  );
};

export default usePostUserServiceMutation;
