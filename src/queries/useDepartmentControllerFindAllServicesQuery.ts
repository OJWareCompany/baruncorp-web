import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { ServiceResponseDto } from "@/api";

export const QUERY_KEY = "departmentControllerFindAllServices";

const useDepartmentControllerFindAllServicesQuery = () => {
  const api = useApi();

  return useQuery<ServiceResponseDto[], AxiosError<ErrorResponseData>>({
    queryKey: [QUERY_KEY],
    queryFn: () =>
      api.departments
        .departmentControllerFindAllServices()
        .then(({ data }) => data),
  });
};

export default useDepartmentControllerFindAllServicesQuery;
