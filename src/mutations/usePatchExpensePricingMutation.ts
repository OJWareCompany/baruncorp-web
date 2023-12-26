import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { UpdateExpensePricingRequestDto } from "@/api";

const usePatchExpensePricingMutation = ({
  organizationId,
  taskId,
}: {
  organizationId: string;
  taskId: string;
}) => {
  const api = useApi();

  return useMutation<
    void,
    AxiosError<ErrorResponseData>,
    UpdateExpensePricingRequestDto
  >((reqData) => {
    return api.expensePricings
      .updateExpensePricingHttpControllerPatch(taskId, organizationId, reqData)
      .then(({ data: resData }) => resData);
  });
};

export default usePatchExpensePricingMutation;
