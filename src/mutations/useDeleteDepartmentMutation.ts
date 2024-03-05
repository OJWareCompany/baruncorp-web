import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";

const useDeleteDepartmentMutation = (departmentId: string) => {
  const api = useApi();

  return useMutation<void, AxiosError<ErrorResponseData>>({
    mutationFn: () => {
      return api.departments
        .deleteDepartmentHttpControllerDelete(departmentId, {})
        .then(({ data: resData }) => resData);
    },
  });
};

export default useDeleteDepartmentMutation;
