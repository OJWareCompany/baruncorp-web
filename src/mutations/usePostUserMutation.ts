import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { CreateUserRequestDto, IdResponse } from "@/api";

const usePostUserMutation = () => {
  const api = useApi();

  return useMutation<
    IdResponse,
    AxiosError<ErrorResponseData>,
    CreateUserRequestDto
  >((reqData) => {
    return api.users
      .createUserHttpContollerCreateUnregisteredUser(reqData)
      .then(({ data: resData }) => resData);
  });
};

export default usePostUserMutation;
