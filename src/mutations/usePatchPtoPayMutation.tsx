import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { UpdatePtoPayRequestDto } from "@/api";

interface Variables extends UpdatePtoPayRequestDto {
  ptoId: string;
}

const usePatchPtoPayMutation = () => {
  const api = useApi();

  return useMutation<void, AxiosError<ErrorResponseData>, Variables>(
    ({ ptoId, ...reqData }) => {
      return api.ptos
        .updatePtoPayHttpControllerPatch(ptoId, reqData)
        .then(({ data: resData }) => resData);
    }
  );
};

export default usePatchPtoPayMutation;
