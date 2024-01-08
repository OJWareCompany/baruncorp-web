import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import {
  IdResponse,
} from "@/api";

const usePatchUserReactivateMutation = (userId: string) => {
  const api = useApi();

  return useMutation<IdResponse, AxiosError<ErrorResponseData>>(() => {
    return api.users
      .reactivateUserHttpControllerPost(userId)
      .then(({ data: resData }) => resData);
  });
};

export default usePatchUserReactivateMutation;
