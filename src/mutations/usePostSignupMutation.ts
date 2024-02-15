import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { SignUpRequestDto } from "@/api/api-spec";

const usePostSignupMutation = (userId: string) => {
  const api = useApi();

  return useMutation<void, AxiosError<ErrorResponseData>, SignUpRequestDto>({
    mutationFn: (reqData) => {
      return api.signUp
        .signUpHttpControllerPost(userId, reqData)
        .then(({ data: resData }) => resData);
    },
  });
};

export default usePostSignupMutation;
