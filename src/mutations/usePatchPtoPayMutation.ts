import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { UpdatePtoPayRequestDto } from "@/api/api-spec";

interface Variables extends UpdatePtoPayRequestDto {
  ptoId: string;
}

const usePatchPtoPayMutation = () => {
  const api = useApi();

  return useMutation<void, AxiosError<ErrorResponseData>, Variables>({
    mutationFn: ({ ptoId, ...reqData }) => {
      return api.ptos
        .updatePtoPayHttpControllerPatch(ptoId, reqData)
        .then(({ data: resData }) => resData);
    },
  });
};

export default usePatchPtoPayMutation;
