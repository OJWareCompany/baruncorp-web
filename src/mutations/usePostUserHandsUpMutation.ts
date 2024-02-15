import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";

const usePostUserHandsUpMutation = () => {
  const api = useApi();

  return useMutation<void, AxiosError<ErrorResponseData>>({
    mutationFn: () => {
      return api.users
        .handsUpHttpControllerPatch()
        .then(({ data: resData }) => resData);
    },
  });
};

export default usePostUserHandsUpMutation;
