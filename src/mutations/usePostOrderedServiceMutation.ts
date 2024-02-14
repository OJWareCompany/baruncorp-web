import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { CreateOrderedServiceRequestDto, IdResponse } from "@/api/api-spec";

const usePostOrderedServiceMutation = () => {
  const api = useApi();

  return useMutation<
    IdResponse,
    AxiosError<ErrorResponseData>,
    CreateOrderedServiceRequestDto
  >((reqData) => {
    return api.orderedServices
      .createOrderedServiceHttpControllerPost(reqData)
      .then(({ data: resData }) => resData);
  });
};

export default usePostOrderedServiceMutation;
