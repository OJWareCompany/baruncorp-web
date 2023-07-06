import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { QUERY_KEY as profileQueryKey } from "./useProfileQuery";
import useApiClient from "@/hook/useApiClient";
import { UserServiceDeleteReqDto } from "@/types/dto/departments";

const useDeleteUserServiceMutation = (userId: string) => {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  return useMutation<
    void,
    AxiosError<ErrorResponseData>,
    UserServiceDeleteReqDto["serviceId"]
  >(
    (serviceId) => {
      const params: UserServiceDeleteReqDto = {
        userId,
        serviceId,
      };

      return apiClient
        .delete<void>("/departments/member-services", {
          params,
        })
        .then(({ data }) => data);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [profileQueryKey, userId] });
      },
    }
  );
};

export default useDeleteUserServiceMutation;
