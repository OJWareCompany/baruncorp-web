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
    refetchOnWindowFocus: false, // TODO: 이후에 모든 query에 적용할지 논의 필요
  });
};

export default useStatesQuery;
