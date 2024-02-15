import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { CreatePtoDetailRequestDto, IdResponse } from "@/api/api-spec";

const usePostPtoDetailMutation = () => {
  const api = useApi();

  return useMutation<
    IdResponse,
    AxiosError<ErrorResponseData>,
    CreatePtoDetailRequestDto
  >({
    mutationFn: (reqData) => {
      return api.ptos
        .createPtoDetailHttpControllerPost(reqData)
        .then(({ data: resData }) => resData);
    },
  });
};

export default usePostPtoDetailMutation;
