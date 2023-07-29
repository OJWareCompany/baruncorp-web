import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { CreateInvitationMailRequestDto } from "@/api";

const useUsersControllerSendInvitationMailMutation = () => {
  const api = useApi();

  return useMutation<
    object, // TODO: replace object with proper type
    AxiosError<ErrorResponseData>,
    CreateInvitationMailRequestDto
  >((reqData) =>
    api.users
      .usersControllerSendInvitationMail(reqData)
      .then(({ data: resData }) => resData)
  );
};

export default useUsersControllerSendInvitationMailMutation;
