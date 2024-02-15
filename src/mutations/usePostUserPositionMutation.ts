import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { AddPositionWorkerRequestDto } from "@/api/api-spec";

interface Variables extends AddPositionWorkerRequestDto {
  positionId: string;
}

const usePostUserPositionMutation = () => {
  const api = useApi();

  return useMutation<void, AxiosError<ErrorResponseData>, Variables>({
    mutationFn: (reqData) => {
      return api.positions
        .addPositionWorkerHttpControllerPost(reqData.positionId, {
          userId: reqData.userId,
        })
        .then(({ data: resData }) => resData);
    },
  });
};

export default usePostUserPositionMutation;
