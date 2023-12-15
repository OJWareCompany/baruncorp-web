import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { ServiceResponseDto } from "@/api";

export const getServiceQueryKey = (serviceId: string) => [
  "services",
  "detail",
  serviceId,
];

const useServiceQuery = (serviceId: string) => {
  const api = useApi();

  return useQuery<ServiceResponseDto, AxiosError<ErrorResponseData>>({
    queryKey: getServiceQueryKey(serviceId),
    queryFn: () =>
      api.services
        .findServiceHttpControllerGet(serviceId)
        .then(({ data }) => data),
    enabled: serviceId !== "",
  });
};

export default useServiceQuery;
