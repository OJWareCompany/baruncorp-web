import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { AhjsGetResDto } from "@/types/dto/ahjs";

export const QUERY_KEY = "ahjs";

const useAhjsQuery = () => {
  const api = useApi();

  return useQuery<AhjsGetResDto, AxiosError<ErrorResponseData>>({
    queryKey: [QUERY_KEY],
    queryFn: () =>
      api
        .get<AhjsGetResDto>("/geography/notes", {
          params: {
            pageNo: 1,
          },
        }) // TODO: pagination 적용
        .then(({ data }) => data),
  });
};

export default useAhjsQuery;
