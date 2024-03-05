import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { UpdateDepartmentRequestDto } from "@/api/api-spec";

const usePatchDepartmentMutation = (departmentId: string) => {
  const api = useApi();

  return useMutation<
    void,
    AxiosError<ErrorResponseData>,
    UpdateDepartmentRequestDto
  >({
    mutationFn: (reqData) => {
      return api.departments
        .updateDepartmentHttpControllerPatch(departmentId, reqData)
        .then(({ data: resData }) => resData);
    },
  });
};

export default usePatchDepartmentMutation;
