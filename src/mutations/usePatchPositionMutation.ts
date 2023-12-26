import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { UpdatePositionRequestDto } from "@/api";

const usePatchPositionMutation = (positionId: string) => {
  const api = useApi();

  return useMutation<
    void,
    AxiosError<ErrorResponseData>,
    UpdatePositionRequestDto
  >((reqData) => {
    return api.positions
      .updatePositionHttpControllerPatch(positionId, reqData)
      .then(({ data: resData }) => resData);
  });
};

export default usePatchPositionMutation;
