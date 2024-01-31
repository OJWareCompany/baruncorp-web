import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { CreateProjectRequestDto, IdResponse } from "@/api/api-spec";

const usePostProjectMutation = () => {
  const api = useApi();

  return useMutation<
    IdResponse,
    AxiosError<ErrorResponseData>,
    CreateProjectRequestDto
  >((reqData) => {
    return api.projects
      .createProjectHttpControllerPostCreateProejct(reqData)
      .then(({ data: resData }) => resData);
  });
};

export default usePostProjectMutation;
