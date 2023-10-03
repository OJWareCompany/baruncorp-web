import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { PaginationState } from "@tanstack/react-table";
import useApi from "@/hook/useApi";
import { JobPaginatedResponseDto } from "@/api";

interface Props {
  pagination: PaginationState;
}

const usePaginatedMyActiveJobsQuery = ({
  pagination: { pageIndex, pageSize },
}: Props) => {
  const api = useApi();

  return useQuery<JobPaginatedResponseDto, AxiosError<ErrorResponseData>>({
    queryKey: ["my-active-jobs", "list", { pageIndex, pageSize }],
    queryFn: () =>
      api.myActiveJobs
        .findMyActiveJobPaginatedHttpControllerFindJob({
          page: pageIndex + 1,
          limit: pageSize,
        })
        .then(({ data }) => data),
    keepPreviousData: true,
  });
};

export default usePaginatedMyActiveJobsQuery;
