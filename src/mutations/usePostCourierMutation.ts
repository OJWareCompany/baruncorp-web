import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { CreateCouriersRequestDto, IdResponse } from "@/api/api-spec";

const usePostCourierMutation = () => {
  const api = useApi();

  return useMutation<
    IdResponse,
    AxiosError<ErrorResponseData>,
    CreateCouriersRequestDto
  >({
    mutationFn: (reqData) => {
      return api.couriers
        .createCouriersHttpControllerPost(reqData)
        .then(({ data: resData }) => resData);
    },
  });
};

export default usePostCourierMutation;
