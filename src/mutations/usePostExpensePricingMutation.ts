import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { CreateExpensePricingRequestDto, IdResponse } from "@/api";

const usePostExpensePricingMutation = () => {
  const api = useApi();

  return useMutation<
    IdResponse,
    AxiosError<ErrorResponseData>,
    CreateExpensePricingRequestDto
  >((reqData) =>
    api.expensePricings
      .createExpensePricingHttpControllerPost(reqData)
      .then(({ data: resData }) => resData)
  );
};

export default usePostExpensePricingMutation;
