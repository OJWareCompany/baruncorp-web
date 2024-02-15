import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { CreateUtilityRequestDto, IdResponse } from "@/api/api-spec";

const usePostUtilityMutation = () => {
  const api = useApi();

  return useMutation<
    IdResponse,
    AxiosError<ErrorResponseData>,
    CreateUtilityRequestDto
  >((reqData) =>
    api.utilities
      .createUtilityHttpControllerPost(reqData)
      .then(({ data: resData }) => resData)
  );
};

export default usePostUtilityMutation;
