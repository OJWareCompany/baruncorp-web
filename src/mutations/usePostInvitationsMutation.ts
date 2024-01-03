import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { InviteRequestDto } from "@/api";

const usePostInvitationsMutation = () => {
  const api = useApi();

  return useMutation<void, AxiosError<ErrorResponseData>, InviteRequestDto>(
    (reqData) =>
      api.invitations
        .inviteHttpControllerPost(reqData)
        .then(({ data: resData }) => resData)
  );
};

export default usePostInvitationsMutation;
