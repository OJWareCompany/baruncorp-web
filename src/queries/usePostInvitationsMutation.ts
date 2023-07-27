import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import {
  InvitationsPostReqDto,
  InvitationsPostResDto,
} from "@/types/dto/users";
import useApi from "@/hook/useApi";

const usePostInvitationsMutation = () => {
  const api = useApi();

  return useMutation<
    InvitationsPostResDto,
    AxiosError<ErrorResponseData>,
    InvitationsPostReqDto
  >((data) =>
    api
      .post<InvitationsPostResDto>("/users/invitations", data)
      .then(({ data }) => data)
  );
};

export default usePostInvitationsMutation;
