import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { UpdateUtilityRequestDto } from "@/api/api-spec";

interface Variables extends UpdateUtilityRequestDto {
  utilityId: string;
}

const usePatchUtilityNoteMutation = () => {
  const api = useApi();

  return useMutation<void, AxiosError<ErrorResponseData>, Variables>({
    mutationFn: ({ utilityId, ...reqData }) => {
      return api.utilities
        .updateUtilityHttpControllerPatch(utilityId, reqData)
        .then(({ data: resData }) => resData);
    },
  });
};

export default usePatchUtilityNoteMutation;
