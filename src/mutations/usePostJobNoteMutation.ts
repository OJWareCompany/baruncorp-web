import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { CreateJobNoteRequestDto, IdResponse } from "@/api";

const usePostJobNoteMutation = () => {
  const api = useApi();

  return useMutation<
    IdResponse,
    AxiosError<ErrorResponseData>,
    CreateJobNoteRequestDto
  >((reqData) => {
    return api.orderedJobNotes
      .createJobNoteHttpControllerCreate(reqData)
      .then(({ data: resData }) => resData);
  });
};

export default usePostJobNoteMutation;
