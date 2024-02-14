import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { CreateTrackingNumbersRequestDto, IdResponse } from "@/api/api-spec";

const usePostTrackingNumberMutation = () => {
  const api = useApi();

  return useMutation<
    IdResponse,
    AxiosError<ErrorResponseData>,
    CreateTrackingNumbersRequestDto
  >((reqData) => {
    return api.trackingNumbers
      .createTrackingNumbersHttpControllerPost(reqData)
      .then(({ data: resData }) => resData);
  });
};

export default usePostTrackingNumberMutation;
