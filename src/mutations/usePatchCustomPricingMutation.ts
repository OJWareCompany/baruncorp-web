import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { UpdateCustomPricingRequestDto } from "@/api";

const usePutCustomPricingMutation = ({
  organizationId,
  serviceId,
}: {
  organizationId: string;
  serviceId: string;
}) => {
  const api = useApi();

  return useMutation<
    void,
    AxiosError<ErrorResponseData>,
    UpdateCustomPricingRequestDto
  >((reqData) => {
    return api.customPricings
      .updateCustomPricingHttpControllerPut(organizationId, serviceId, reqData)
      .then(({ data: resData }) => resData);
  });
};

export default usePutCustomPricingMutation;
