import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import {
  InvitationsPostReqDto,
  InvitationsPostResDto,
} from "@/types/dto/users";
import useApiClient from "@/hook/useApiClient";

const usePostInvitationsMutation = () => {
  const apiClient = useApiClient();

  return useMutation<
    InvitationsPostResDto,
    AxiosError<ErrorResponseData>,
    InvitationsPostReqDto
  >((data) =>
    apiClient
      .post<InvitationsPostResDto>("/users/invitations", data)
      .then(({ data }) => data)
  );
};

export default usePostInvitationsMutation;
