import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { UpdateUserRequestDto } from "../api/index";
import useApi from "@/hook/useApi";
import useProfileQueryInvalidation from "@/hook/useProfileQueryInvalidation";

const usePatchProfileMutation = () => {
  const api = useApi();
  const invalidate = useProfileQueryInvalidation();

  return useMutation<void, AxiosError<ErrorResponseData>, UpdateUserRequestDto>(
    (data) => {
      return api.users
        .usersControllerPatchUpdateUser(data)
        .then(({ data }) => data);
    },
    {
      onSuccess: () => invalidate(),
    }
  );
};

export default usePatchProfileMutation;
