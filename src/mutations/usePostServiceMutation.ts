import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { CreateServiceRequestDto, IdResponse } from "@/api/api-spec";

const usePostServiceMutation = () => {
  const api = useApi();

  return useMutation<
    IdResponse,
    AxiosError<ErrorResponseData>,
    CreateServiceRequestDto
  >((reqData) => {
    return api.services
      .createServiceHttpControllerPostCreateService(reqData)
      .then(({ data: resData }) => resData);
  });
};

export default usePostServiceMutation;
