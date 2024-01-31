import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { UpdatePositionOrderRequestDto } from "@/api/api-spec";

const usePatchTaskPositionOrderMutation = (taskId: string) => {
  const api = useApi();

  return useMutation<
    void,
    AxiosError<ErrorResponseData>,
    UpdatePositionOrderRequestDto
  >((reqData) => {
    return api.tasks
      .updatePositionOrderHttpControllerPatch(taskId, reqData)
      .then(({ data: resData }) => resData);
  });
};

export default usePatchTaskPositionOrderMutation;
