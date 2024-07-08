import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { ChangePasswordRequestDto } from "@/api/api-spec";

const usePostChangePasswordMutation = () => {
  const api = useApi();

  return useMutation<
    void,
    AxiosError<ErrorResponseData>,
    ChangePasswordRequestDto
  >({
    mutationFn: (reqData) => {
      return api.users
        .changePasswordHttpControllerPostChangePassword(reqData)
        .then(({ data: resData }) => resData);
    },
  });
};

export default usePostChangePasswordMutation;
