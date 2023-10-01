import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { PaginationState } from "@tanstack/react-table";
import useApi from "@/hook/useApi";
import { UserPaginatedResopnseDto } from "@/api";

interface Props {
  pagination: PaginationState;
  initialData: UserPaginatedResopnseDto | null;
}

const usePaginatedUsersQuery = ({
  initialData,
  pagination: { pageIndex, pageSize },
}: Props) => {
  const api = useApi();

  return useQuery<UserPaginatedResopnseDto, AxiosError<ErrorResponseData>>({
    queryKey: ["users", "list", { pageIndex, pageSize }],
    queryFn: () =>
      api.users
        .findUsersHttpControllerGetFindUsers({
          page: pageIndex + 1,
          limit: pageSize,
        })
        .then(({ data }) => data),
    placeholderData: initialData == null ? undefined : initialData,
    keepPreviousData: true,
  });
};

export default usePaginatedUsersQuery;
