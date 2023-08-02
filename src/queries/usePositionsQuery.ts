import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { PositionResponseDto } from "@/api";

export const QUERY_KEY = "positions";

const usePositionsQuery = () => {
  const api = useApi();

  return useQuery<PositionResponseDto[], AxiosError<ErrorResponseData>>({
    queryKey: [QUERY_KEY],
    queryFn: () =>
      api.departments
        .departmentControllerGetFindAllPositions()
        .then(({ data }) => data),
  });
};

export default usePositionsQuery;
