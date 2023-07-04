import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApiClient from "@/hook/useApiClient";
import { ServicesGetResDto } from "@/types/dto/service";

export const QUERY_KEY = "services";

const useServicesQuery = () => {
  const apiClient = useApiClient();

  return useQuery<ServicesGetResDto, AxiosError<ErrorResponseData>>({
    queryKey: [QUERY_KEY],
    queryFn: () =>
      apiClient
        .get<ServicesGetResDto>("/departments/services")
        .then(({ data }) => data),
    refetchOnWindowFocus: false, // TODO: 이후에 모든 query에 적용할지 논의 필요
  });
};

export default useServicesQuery;
