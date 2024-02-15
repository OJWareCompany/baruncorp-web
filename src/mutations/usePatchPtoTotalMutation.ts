import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { UpdatePtoTotalRequestDto } from "@/api/api-spec";

const usePatchPtoTotalMutation = (ptoId: string) => {
  const api = useApi();

  return useMutation<
    void,
    AxiosError<ErrorResponseData>,
    UpdatePtoTotalRequestDto
  >({
    mutationFn: (reqData) => {
      return api.ptos
        .updatePtoTotalHttpControllerPatch(ptoId, reqData)
        .then(({ data: resData }) => resData);
    },
  });
};

export default usePatchPtoTotalMutation;
