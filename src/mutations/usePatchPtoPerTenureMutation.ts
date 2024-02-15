import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { UpdatePtoTenurePolicyRequestDto } from "@/api/api-spec";

const usePatchPtoPerTenureMutation = (ptoTenurePolicyId: string) => {
  const api = useApi();

  return useMutation<
    void,
    AxiosError<ErrorResponseData>,
    UpdatePtoTenurePolicyRequestDto
  >({
    mutationFn: (reqData) => {
      return api.ptoTenurePolicies
        .updatePtoTenurePolicyHttpControllerPatch(ptoTenurePolicyId, reqData)
        .then(({ data: resData }) => resData);
    },
  });
};

export default usePatchPtoPerTenureMutation;
