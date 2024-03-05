import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { RemoveUserRequestDto } from "@/api/api-spec";

interface Variables extends RemoveUserRequestDto {
  departmentId: string;
}

const usePostDepartmentRemoveUserMutation = () => {
  const api = useApi();

  return useMutation<void, AxiosError<ErrorResponseData>, Variables>({
    mutationFn: ({ departmentId, ...reqData }) => {
      return api.departments
        .removeUserHttpControllerRemove(departmentId, reqData)
        .then(({ data: resData }) => resData);
    },
  });
};

export default usePostDepartmentRemoveUserMutation;
