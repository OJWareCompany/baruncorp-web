import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { StatesGetResDto } from "@/types/dto/departments";

export const QUERY_KEY = "states";

const useStatesQuery = () => {
  const api = useApi();

  return useQuery<StatesGetResDto, AxiosError<ErrorResponseData>>({
    queryKey: [QUERY_KEY],
    queryFn: () =>
      api.get<StatesGetResDto>("/departments/states").then(({ data }) => data),
  });
};

export default useStatesQuery;
