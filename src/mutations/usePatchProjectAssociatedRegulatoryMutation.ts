import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { UpdateProjectAssociatedRegulatoryRequestDto } from "@/api/api-spec";

const usePatchProjectAssociatedRegulatoryMutation = (projectId: string) => {
  const api = useApi();

  // return useMutation<void, AxiosError<ErrorResponseData>, Variables>({
  return useMutation<
    void,
    AxiosError<ErrorResponseData>,
    UpdateProjectAssociatedRegulatoryRequestDto
  >({
    mutationFn: ({ ...reqData }) => {
      return api.projects
        .updateProjectAssociatedRegulatoryHttpControllerUpdate(
          projectId,
          reqData
        )
        .then(({ data: resData }) => {
          return resData;
        });
    },
  });
};

export default usePatchProjectAssociatedRegulatoryMutation;
