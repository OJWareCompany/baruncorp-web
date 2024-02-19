import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import {
  CreateJobNoteRequestDto,
  CreateJobNoteResponseDto,
  RequestParams,
} from "@/api/api-spec";

const usePostJobNoteMutation = (reqParams?: RequestParams) => {
  const api = useApi();

  return useMutation<
    CreateJobNoteResponseDto,
    AxiosError<ErrorResponseData>,
    CreateJobNoteRequestDto
  >({
    mutationFn: (reqData) => {
      return api.orderedJobNotes
        .createJobNoteHttpControllerCreate(reqData, reqParams)
        .then(({ data: resData }) => resData);
    },
  });
};

export default usePostJobNoteMutation;
