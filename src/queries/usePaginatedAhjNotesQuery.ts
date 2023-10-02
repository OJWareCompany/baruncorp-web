import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { PaginationState } from "@tanstack/react-table";
import useApi from "@/hook/useApi";
import { AhjNotePaginatedResponseDto } from "@/api";

interface Props {
  pagination: PaginationState;
}

const usePaginatedAhjNotesQuery = ({
  pagination: { pageIndex, pageSize },
}: Props) => {
  const api = useApi();

  return useQuery<AhjNotePaginatedResponseDto, AxiosError<ErrorResponseData>>({
    queryKey: ["ahjNotes", "list", { pageIndex, pageSize }],
    queryFn: () =>
      api.geography
        .geographyControllerGetFindNotes({
          page: pageIndex + 1,
          limit: pageSize,
        })
        .then(({ data }) => data),
    keepPreviousData: true,
  });
};

export default usePaginatedAhjNotesQuery;
