import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";

const useDeleteTrackingNumberMutation = () => {
  const api = useApi();

  return useMutation<
    void,
    AxiosError<ErrorResponseData>,
    { trackingNumberId: string }
  >({
    mutationFn: ({ trackingNumberId }) => {
      return api.trackingNumbers
        .deleteTrackingNumbersHttpControllerPatch(trackingNumberId)
        .then(({ data: resData }) => resData);
    },
  });
};

export default useDeleteTrackingNumberMutation;
