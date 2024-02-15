import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { UpdatePtoDetailRequestDto } from "@/api/api-spec";

interface Variables extends UpdatePtoDetailRequestDto {
  ptoId: string;
}

const usePatchPtoDetailMutation = () => {
  const api = useApi();

  return useMutation<void, AxiosError<ErrorResponseData>, Variables>({
    mutationFn: ({ ptoId, ...reqData }) => {
      return api.ptos
        .updatePtoDetailHttpControllerPatch(ptoId, reqData)
        .then(({ data: resData }) => resData);
    },
  });
};

export default usePatchPtoDetailMutation;
