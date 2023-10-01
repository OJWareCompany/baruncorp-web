import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { ServicePaginatedResponseDto, ServiceResponseDto } from "@/api";

const useAllServicesQuery = (
  initialData?: ServicePaginatedResponseDto | null
) => {
  const api = useApi();

  return useQuery<ServicePaginatedResponseDto, AxiosError<ErrorResponseData>>({
    queryKey: ["services", "list"],
    queryFn: () =>
      api.services
        .findServicePaginatedHttpControllerGet({
          limit: Number.MAX_SAFE_INTEGER,
        })
        .then(({ data }) => data),
    initialData: initialData == null ? undefined : initialData,
  });
};

export default useAllServicesQuery;
