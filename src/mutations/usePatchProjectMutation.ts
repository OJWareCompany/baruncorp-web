import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { UpdateProjectRequestDto } from "@/api/api-spec";

const usePatchProjectMutation = (projectId: string) => {
  const api = useApi();

  return useMutation<
    void,
    AxiosError<ErrorResponseData>,
    UpdateProjectRequestDto
  >((reqData) => {
    return api.projects
      .updateProjectHttpControllerUpdate(projectId, reqData)
      .then(({ data: resData }) => resData);
  });
};

export default usePatchProjectMutation;
