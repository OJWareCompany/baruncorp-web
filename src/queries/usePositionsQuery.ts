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
  });
};

export default usePositionsQuery;
