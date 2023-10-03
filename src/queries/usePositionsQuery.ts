import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { PositionResponseDto } from "@/api";

const usePositionsQuery = () => {
  const api = useApi();

  return useQuery<PositionResponseDto[], AxiosError<ErrorResponseData>>({
    queryKey: ["positions", "list"],
    queryFn: () =>
      api.departments
        .departmentControllerGetFindAllPositions()
        .then(({ data }) => data),
  });
};

export default usePositionsQuery;
