import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { PaginationState } from "@tanstack/react-table";
import useApi from "@/hook/useApi";
import { AhjsGetResDto } from "@/types/dto/ahjs";

export const QUERY_KEY = "ahjs";

const useAhjsQuery = ({ pageIndex, pageSize }: PaginationState) => {
  const api = useApi();

  return useQuery<AhjsGetResDto, AxiosError<ErrorResponseData>>({
    queryKey: [QUERY_KEY, pageIndex, pageSize],
    queryFn: () =>
      api
        .get<AhjsGetResDto>("/geography/notes", {
          params: {
            page: pageIndex + 1,
            limit: pageSize,
          },
        })
        .then(({ data }) => data),
    keepPreviousData: true,
  });
};

export default useAhjsQuery;
