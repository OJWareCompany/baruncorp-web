import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { UpdateServiceRequestDto } from "@/api";

const usePatchServiceMutation = (serviceId: string) => {
  const api = useApi();

  return useMutation<
    void,
    AxiosError<ErrorResponseData>,
    UpdateServiceRequestDto
  >((reqData) => {
    return api.services
      .updateServiceHttpControllerPatch(serviceId, reqData)
      .then(({ data: resData }) => resData);
  });
};

export default usePatchServiceMutation;
