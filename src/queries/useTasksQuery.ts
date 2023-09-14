import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { ServiceResponseDto } from "@/api";

const useTasksQuery = () => {
  const api = useApi();

  return useQuery<ServiceResponseDto[], AxiosError<ErrorResponseData>>({
    queryKey: ["tasks", "list"],
    queryFn: () =>
      api.departments
        .departmentControllerGetFindAllServices()
        .then(({ data }) => data),
  });
};

export default useTasksQuery;
