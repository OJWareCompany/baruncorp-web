import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { StatesResponseDto } from "@/api";

export const QUERY_KEY = "departmentControllerFindAllStates";

const useDepartmentControllerFindAllStatesQuery = () => {
  const api = useApi();

  return useQuery<StatesResponseDto[], AxiosError<ErrorResponseData>>({
    queryKey: [QUERY_KEY],
    queryFn: () =>
      api.departments
        .departmentControllerFindAllStates()
        .then(({ data }) => data),
  });
};

export default useDepartmentControllerFindAllStatesQuery;
