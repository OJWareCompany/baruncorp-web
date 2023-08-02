import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { ServiceResponseDto } from "@/api";

export const QUERY_KEY = "services";

const useServicesQuery = () => {
  const api = useApi();

  return useQuery<ServiceResponseDto[], AxiosError<ErrorResponseData>>({
    queryKey: [QUERY_KEY],
    queryFn: () =>
      api.departments
        .departmentControllerGetFindAllServices()
        .then(({ data }) => data),
  });
};

export default useServicesQuery;
