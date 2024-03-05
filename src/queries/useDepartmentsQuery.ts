import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import {
  FindDepartmentPaginatedHttpControllerGetParams,
  DepartmentPaginatedResponseDto,
} from "@/api/api-spec";

export const getDepartmentsQueryKey = (
  params: FindDepartmentPaginatedHttpControllerGetParams
) => ["departments", "list", params];

const useDepartmentsQuery = ({
  params,
  enabled,
  isKeepPreviousData,
}: {
  params: FindDepartmentPaginatedHttpControllerGetParams;
  isKeepPreviousData?: boolean;
  enabled?: boolean;
}) => {
  const api = useApi();

  return useQuery<
    DepartmentPaginatedResponseDto,
    AxiosError<ErrorResponseData>
  >({
    queryKey: getDepartmentsQueryKey(params),
    queryFn: () =>
      api.departments
        .findDepartmentPaginatedHttpControllerGet(params)
        .then(({ data }) => data),
    placeholderData: isKeepPreviousData ? keepPreviousData : undefined,
    enabled,
  });
};

export default useDepartmentsQuery;
