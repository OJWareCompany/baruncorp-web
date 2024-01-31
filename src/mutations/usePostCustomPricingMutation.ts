import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { CreateCustomPricingRequestDto, IdResponse } from "@/api/api-spec";

const usePostCustomPricingMutation = () => {
  const api = useApi();

  return useMutation<
    IdResponse,
    AxiosError<ErrorResponseData>,
    CreateCustomPricingRequestDto
  >((reqData) =>
    api.customPricings
      .createCustomPricingHttpControllerPost(reqData)
      .then(({ data: resData }) => resData)
  );
};

export default usePostCustomPricingMutation;
