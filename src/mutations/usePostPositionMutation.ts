import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { CreatePositionRequestDto, IdResponse } from "@/api";

const usePostPositionMutation = () => {
  const api = useApi();

  return useMutation<
    IdResponse,
    AxiosError<ErrorResponseData>,
    CreatePositionRequestDto
  >((reqData) => {
    return api.positions
      .createPositionHttpControllerPost(reqData)
      .then(({ data: resData }) => resData);
  });
};

export default usePostPositionMutation;
