import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";

const useDeletePositionUserMutation = (positionId: string) => {
  const api = useApi();

  return useMutation<
    void,
    AxiosError<ErrorResponseData>,
    {
      userId: string;
    }
  >((reqData) => {
    return api.positions
      .deletePositionWorkerHttpControllerDelete(positionId, reqData.userId)
      .then(({ data: resData }) => resData);
  });
};

export default useDeletePositionUserMutation;
