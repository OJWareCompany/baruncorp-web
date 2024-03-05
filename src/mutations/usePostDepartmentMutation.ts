import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { CreateDepartmentRequestDto, IdResponse } from "@/api/api-spec";

const usePostDepartmentMutation = () => {
  const api = useApi();

  return useMutation<
    IdResponse,
    AxiosError<ErrorResponseData>,
    CreateDepartmentRequestDto
  >({
    mutationFn: (reqData) => {
      return api.departments
        .createDepartmentHttpControllerPost(reqData)
        .then(({ data: resData }) => resData);
    },
  });
};

export default usePostDepartmentMutation;
