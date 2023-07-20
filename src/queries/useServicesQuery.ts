import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApiClient from "@/hook/useApiClient";
import { ServicesGetResDto } from "@/types/dto/departments";

export const QUERY_KEY = "services";

const useServicesQuery = () => {
  const apiClient = useApiClient();

  return useQuery<ServicesGetResDto, AxiosError<ErrorResponseData>>({
    queryKey: [QUERY_KEY],
    queryFn: () =>
      apiClient
        .get<ServicesGetResDto>("/departments/services")
        .then(({ data }) => data),
  });
};

export default useServicesQuery;
