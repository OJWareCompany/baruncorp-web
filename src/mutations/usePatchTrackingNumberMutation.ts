import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { UpdateTrackingNumbersRequestDto } from "@/api/api-spec";

interface Variables extends UpdateTrackingNumbersRequestDto {
  trackingNumberId: string;
}

const usePatchTrackingNumberMutation = () => {
  const api = useApi();

  return useMutation<void, AxiosError<ErrorResponseData>, Variables>({
    mutationFn: ({ trackingNumberId, ...reqData }) => {
      return api.trackingNumbers
        .updateTrackingNumbersHttpControllerPatch(trackingNumberId, reqData)
        .then(({ data: resData }) => resData);
    },
  });
};

export default usePatchTrackingNumberMutation;
