import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { UpdatePtoDetailRequestDto } from "@/api";

interface Variables extends UpdatePtoDetailRequestDto {
  ptoId: string;
}

const usePatchPtoDetailMutation = () => {
  const api = useApi();

  return useMutation<void, AxiosError<ErrorResponseData>, Variables>(
    ({ ptoId, ...reqData }) => {
      return api.ptos
        .updatePtoDetailHttpControllerPatch(ptoId, reqData)
        .then(({ data: resData }) => resData);
    }
  );
};

export default usePatchPtoDetailMutation;
