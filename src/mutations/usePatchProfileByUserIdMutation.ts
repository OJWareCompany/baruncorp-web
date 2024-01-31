import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { UpdateUserRequestDto } from "@/api/api-spec";

const usePatchProfileByUserIdMutation = (userId: string) => {
  const api = useApi();

  return useMutation<void, AxiosError<ErrorResponseData>, UpdateUserRequestDto>(
    (reqData) => {
      return api.users
        .usersControllerPatchUpdateUserByUserId(userId, reqData)
        .then(({ data: resData }) => resData);
    }
  );
};

export default usePatchProfileByUserIdMutation;
