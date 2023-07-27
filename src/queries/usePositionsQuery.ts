import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { PositionsGetResDto } from "@/types/dto/departments";

export const QUERY_KEY = "positions";

const usePositionsQuery = () => {
  const api = useApi();

  return useQuery<PositionsGetResDto, AxiosError<ErrorResponseData>>({
    queryKey: [QUERY_KEY],
    queryFn: () =>
      api
        .get<PositionsGetResDto>("/departments/positions")
        .then(({ data }) => data),
  });
};

export default usePositionsQuery;
