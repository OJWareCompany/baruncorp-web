import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { DepartmentResponseDto } from "@/api/api-spec";

export const getDepartmentQueryKey = (departmentId: string) => [
  "departments",
  "detail",
  departmentId,
];

const useDepartmentQuery = (departmentId: string) => {
  const api = useApi();

  return useQuery<DepartmentResponseDto, AxiosError<ErrorResponseData>>({
    queryKey: getDepartmentQueryKey(departmentId),
    queryFn: () =>
      api.departments
        .findDepartmentHttpControllerGet(departmentId)
        .then(({ data }) => data),
    enabled: departmentId !== "",
  });
};

export default useDepartmentQuery;
