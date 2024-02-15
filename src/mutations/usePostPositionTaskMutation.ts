import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { AddPositionTaskRequestDto } from "@/api/api-spec";

const usePostPositionTaskMutation = (positionId: string) => {
  const api = useApi();

  return useMutation<
    void,
    AxiosError<ErrorResponseData>,
    AddPositionTaskRequestDto
  >({
    mutationFn: (reqData) => {
      return api.positions
        .addPositionTaskHttpControllerPost(positionId, reqData)
        .then(({ data: resData }) => resData);
    },
  });
};

export default usePostPositionTaskMutation;
