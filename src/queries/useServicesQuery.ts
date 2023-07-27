import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { ServicesGetResDto } from "@/types/dto/departments";

export const QUERY_KEY = "services";

const useServicesQuery = () => {
  const api = useApi();

  return useQuery<ServicesGetResDto, AxiosError<ErrorResponseData>>({
    queryKey: [QUERY_KEY],
    queryFn: () =>
      api
        .get<ServicesGetResDto>("/departments/services")
        .then(({ data }) => data),
  });
};

export default useServicesQuery;
