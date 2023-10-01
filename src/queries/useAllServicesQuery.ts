import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { ServiceResponseDto } from "@/api";

const useAllServicesQuery = (initialData?: ServiceResponseDto[] | null) => {
  const api = useApi();

  return useQuery<ServiceResponseDto[], AxiosError<ErrorResponseData>>({
    queryKey: ["services", "list"],
    queryFn: () =>
      api.services
        .findServicePaginatedHttpControllerGet({
          limit: Number.MAX_SAFE_INTEGER,
        })
        .then(({ data }) => data.items),
    initialData: initialData == null ? undefined : initialData,
  });
};

export default useAllServicesQuery;
