import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { UpdateRevisionSizeRequestDto } from "@/api/api-spec";

const usePatchOrderedServiceRevisionSizeMutation = (
  orderedServiceId: string
) => {
  const api = useApi();

  return useMutation<
    void,
    AxiosError<ErrorResponseData>,
    UpdateRevisionSizeRequestDto
  >((reqData) => {
    return api.orderedServices
      .updateRevisionSizeHttpControllerPatch(orderedServiceId, reqData)
      .then(({ data: resData }) => resData);
  });
};

export default usePatchOrderedServiceRevisionSizeMutation;
