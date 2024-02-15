import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";

const usePostUserHandsDownMutation = () => {
  const api = useApi();

  return useMutation<void, AxiosError<ErrorResponseData>>({
    mutationFn: () => {
      return api.users
        .handsDownHttpControllerPatch()
        .then(({ data: resData }) => resData);
    },
  });
};

export default usePostUserHandsDownMutation;
