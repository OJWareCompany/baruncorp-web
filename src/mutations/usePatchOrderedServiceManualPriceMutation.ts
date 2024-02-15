import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { UpdateManualPriceRequestDto } from "@/api/api-spec";

const usePatchOrderedServiceManualPriceMutation = (
  orderedServiceId: string
) => {
  const api = useApi();

  return useMutation<
    void,
    AxiosError<ErrorResponseData>,
    UpdateManualPriceRequestDto
  >({
    mutationFn: (reqData) => {
      return api.orderedServices
        .updateManualPriceHttpControllerPatch(orderedServiceId, reqData)
        .then(({ data: resData }) => resData);
    },
  });
};

export default usePatchOrderedServiceManualPriceMutation;
