import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";

const usePatchOrderedServiceReactivateMutation = (orderedServiceId: string) => {
  const api = useApi();

  return useMutation<void, AxiosError<ErrorResponseData>>(() => {
    return api.orderedServices
      .reactivateOrderedServiceHttpControllerPatch(orderedServiceId)
      .then(({ data: resData }) => resData);
  });
};

export default usePatchOrderedServiceReactivateMutation;
