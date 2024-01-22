import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { CreatePtoDetailRequestDto, IdResponse } from "@/api";

const usePostPtoDetailMutation = () => {
  const api = useApi();

  return useMutation<
    IdResponse,
    AxiosError<ErrorResponseData>,
    CreatePtoDetailRequestDto
  >((reqData) =>
    api.ptos
      .createPtoDetailHttpControllerPost(reqData)
      .then(({ data: resData }) => resData)
  );
};

export default usePostPtoDetailMutation;
