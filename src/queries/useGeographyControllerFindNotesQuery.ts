import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { PaginationState } from "@tanstack/react-table";
import useApi from "@/hook/useApi";
import { AhjNotePaginatedResponseDto } from "@/api";

export const QUERY_KEY = "geographyControllerFindNotes";

const useGeographyControllerFindNotesQuery = ({
  pageIndex,
  pageSize,
}: PaginationState) => {
  const api = useApi();

  return useQuery<AhjNotePaginatedResponseDto, AxiosError<ErrorResponseData>>({
    queryKey: [QUERY_KEY, pageIndex, pageSize],
    queryFn: () =>
      api.geography
        .geographyControllerFindNotes({ page: pageIndex + 1, limit: pageSize })
        .then(({ data }) => data),
    keepPreviousData: true,
  });
};

export default useGeographyControllerFindNotesQuery;
