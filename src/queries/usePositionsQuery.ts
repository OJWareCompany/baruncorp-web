import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApiClient from "@/hook/useApiClient";
import { PositionsGetResDto } from "@/types/dto/departments";

export const QUERY_KEY = "positions";

const usePositionsQuery = () => {
  const apiClient = useApiClient();

  return useQuery<PositionsGetResDto, AxiosError<ErrorResponseData>>({
    queryKey: [QUERY_KEY],
    queryFn: () =>
      apiClient
        .get<PositionsGetResDto>("/departments/positions")
        .then(({ data }) => data),
    refetchOnWindowFocus: false, // TODO: 이후에 모든 query에 적용할지 논의 필요
  });
};

export default usePositionsQuery;
