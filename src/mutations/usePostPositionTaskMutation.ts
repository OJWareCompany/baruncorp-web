import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { AddPositionTaskRequestDto, IdResponse } from "@/api";

const usePostPositionTaskMutation = (positionId: string) => {
  const api = useApi();

  return useMutation<
    IdResponse,
    AxiosError<ErrorResponseData>,
    AddPositionTaskRequestDto
  >((reqData) => {
    return api.positions
      .addPositionTaskHttpControllerPost(positionId, reqData)
      .then(({ data: resData }) => resData);
  });
};

export default usePostPositionTaskMutation;
