import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { JoinOrganizationRequestDto } from "@/api/api-spec";

const usePostJoinOrganizationMutation = (
  userId: string,
  organizationId: string
) => {
  const api = useApi();

  return useMutation<
    void,
    AxiosError<ErrorResponseData>,
    JoinOrganizationRequestDto
  >({
    mutationFn: (reqData) => {
      return api.users
        .joinOrganizationHttpControllerPost(userId, organizationId, reqData)
        .then(({ data: resData }) => resData);
    },
  });
};

export default usePostJoinOrganizationMutation;
