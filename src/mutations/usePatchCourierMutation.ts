import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { UpdateCouriersRequestDto } from "@/api/api-spec";

interface Variables extends UpdateCouriersRequestDto {
  courierId: string;
}

const usePatchCourierMutation = () => {
  const api = useApi();

  return useMutation<void, AxiosError<ErrorResponseData>, Variables>({
    mutationFn: ({ courierId, ...reqData }) => {
      return api.couriers
        .updateCouriersHttpControllerPatch(courierId, reqData)
        .then(({ data: resData }) => resData);
    },
  });
};

export default usePatchCourierMutation;
