import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { UpdateUserRequestDto } from "@/api";

const usePatchProfileMutation = () => {
  const api = useApi();

  return useMutation<void, AxiosError<ErrorResponseData>, UpdateUserRequestDto>(
    (reqData) => {
      return api.users
        .usersControllerPatchUpdateUser(reqData)
        .then(({ data: resData }) => resData);
    }
  );
};

export default usePatchProfileMutation;
