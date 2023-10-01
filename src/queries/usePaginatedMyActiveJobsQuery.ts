import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { PaginationState } from "@tanstack/react-table";
import useApi from "@/hook/useApi";
import { JobPaginatedResponseDto } from "@/api";

interface Props {
  pagination: PaginationState;
  initialData: JobPaginatedResponseDto | null;
}

const usePaginatedMyActiveJobsQuery = ({
  initialData,
  pagination: { pageIndex, pageSize },
}: Props) => {
  const api = useApi();

  return useQuery<JobPaginatedResponseDto, AxiosError<ErrorResponseData>>({
    queryKey: ["myActiveJobs", "list", { pageIndex, pageSize }],
    queryFn: () =>
      api.myActiveJobs
        .findMyActiveJobPaginatedHttpControllerFindJob({
          page: pageIndex + 1,
          limit: pageSize,
        })
        .then(({ data }) => data),
    placeholderData: initialData == null ? undefined : initialData,
    keepPreviousData: true,
  });
};

export default usePaginatedMyActiveJobsQuery;
