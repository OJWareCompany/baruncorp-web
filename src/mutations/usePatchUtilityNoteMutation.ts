import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { UpdateUtilityRequestDto } from "@/api/api-spec";

const usePatchUtilityNoteMutation = (utilityId: string) => {
  const api = useApi();

  return useMutation<
    void,
    AxiosError<ErrorResponseData>,
    UpdateUtilityRequestDto
  >((reqData) => {
    return api.utilities
      .updateUtilityHttpControllerPatch(utilityId, reqData)
      .then(({ data: resData }) => resData);
  });
};

export default usePatchUtilityNoteMutation;
