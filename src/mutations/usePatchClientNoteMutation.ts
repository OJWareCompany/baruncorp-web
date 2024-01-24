import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { UpdateClientNoteRequestDto } from "@/api";

const usePatchClientNoteMutation = (organizationId: string) => {
  const api = useApi();

  return useMutation<
    void,
    AxiosError<ErrorResponseData>,
    UpdateClientNoteRequestDto
  >((reqData) => {
    return api.clientNote
      .updateClientNoteHttpControllerPatch(organizationId, reqData)
      .then(({ data: resData }) => resData);
  });
};

export default usePatchClientNoteMutation;
