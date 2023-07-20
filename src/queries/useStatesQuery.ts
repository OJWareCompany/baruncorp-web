import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApiClient from "@/hook/useApiClient";
import { StatesGetResDto } from "@/types/dto/departments";

export const QUERY_KEY = "states";

const useStatesQuery = () => {
  const apiClient = useApiClient();

  return useQuery<StatesGetResDto, AxiosError<ErrorResponseData>>({
    queryKey: [QUERY_KEY],
    queryFn: () =>
      apiClient
        .get<StatesGetResDto>("/departments/states")
        .then(({ data }) => data),
  });
};

export default useStatesQuery;
