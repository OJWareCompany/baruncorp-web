import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { SignUpRequestDto } from "@/api";

const usePostUserMutation = () => {
  const api = useApi();

  return useMutation<void, AxiosError<ErrorResponseData>, SignUpRequestDto>(
    (reqData) => {
      return api.auth
        .authenticationControllerPostSignUp(reqData)
        .then(({ data: resData }) => resData);
    }
  );
};

export default usePostUserMutation;
