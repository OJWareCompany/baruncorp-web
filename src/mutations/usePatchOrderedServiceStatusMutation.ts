import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { UpdateOrderedScopeStatusRequestDto } from "@/api/api-spec";

interface Variables extends UpdateOrderedScopeStatusRequestDto {
  orderedServiceId: string;
}

const usePatchOrderedServiceStatusMutation = () => {
  const api = useApi();

  return useMutation<void, AxiosError<ErrorResponseData>, Variables>({
    mutationFn: ({ orderedServiceId, ...reqData }) => {
      return api.orderedServices
        .updateOrderedScopeStatusHttpControllerPatch(orderedServiceId, reqData)
        .then(({ data: resData }) => resData);
    },
  });
};

export default usePatchOrderedServiceStatusMutation;
