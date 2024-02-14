import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { PutScheduleRequestDto } from "@/api/api-spec";

interface Variables extends PutScheduleRequestDto {
  userId: string;
}

const usePutUserScheduleMutation = () => {
  const api = useApi();

  return useMutation<void, AxiosError<ErrorResponseData>, Variables>(
    ({ userId, ...reqData }) => {
      return api.users
        .putScheduleHttpControllerPut(userId, reqData)
        .then(({ data: resData }) => resData);
    }
  );
};

export default usePutUserScheduleMutation;
