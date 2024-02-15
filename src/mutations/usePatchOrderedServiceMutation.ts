import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { UpdateOrderedServiceRequestDto } from "@/api/api-spec";

const usePatchOrderedServiceMutation = (orderedServiceId: string) => {
  const api = useApi();

  return useMutation<
    void,
    AxiosError<ErrorResponseData>,
    UpdateOrderedServiceRequestDto
  >({
    mutationFn: (reqData) => {
      return api.orderedServices
        .updateOrderedServiceHttpControllerPatch(orderedServiceId, reqData)
        .then(({ data: resData }) => resData);
    },
  });
};

export default usePatchOrderedServiceMutation;
