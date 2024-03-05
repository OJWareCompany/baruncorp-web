import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { AddUserRequestDto } from "@/api/api-spec";

interface Variables extends AddUserRequestDto {
  departmentId: string;
}

const usePostDepartmentAddUserMutation = () => {
  const api = useApi();

  return useMutation<void, AxiosError<ErrorResponseData>, Variables>({
    mutationFn: ({ departmentId, ...reqData }) => {
      return api.departments
        .addUserHttpControllerAdd(departmentId, reqData)
        .then(({ data: resData }) => resData);
    },
  });
};

export default usePostDepartmentAddUserMutation;
