import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { CreateInformationRequestDto, IdResponse } from "@/api/api-spec";

const usePostInformationMutation = () => {
  const api = useApi();

  return useMutation<
    IdResponse,
    AxiosError<ErrorResponseData>,
    CreateInformationRequestDto
  >({
    mutationFn: (reqData) => {
      return api.informations
        .createInformationHttpControllerPatch(reqData)
        .then(({ data: resData }) => resData);
    },
  });
};

export default usePostInformationMutation;
