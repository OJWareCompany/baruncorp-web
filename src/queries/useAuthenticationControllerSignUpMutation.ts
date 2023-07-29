import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { SignUpRequestDto } from "@/api";

const useAuthenticationControllerSignUpMutation = () => {
  const api = useApi();

  return useMutation<void, AxiosError<ErrorResponseData>, SignUpRequestDto>(
    (reqData) => {
      return api.auth
        .authenticationControllerSignUp(reqData)
        .then(({ data: resData }) => resData);
    }
  );
};

export default useAuthenticationControllerSignUpMutation;
