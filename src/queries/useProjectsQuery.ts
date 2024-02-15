import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import {
  FindProjectsHttpControllerFindUsersParams,
  ProjectPaginatedResponseDto,
} from "@/api/api-spec";

export const getProjectsQueryKey = (
  params: FindProjectsHttpControllerFindUsersParams
) => ["projects", "list", params];

const useProjectsQuery = (
  params: FindProjectsHttpControllerFindUsersParams,
  isKeepPreviousData?: boolean
) => {
  const api = useApi();

  return useQuery<ProjectPaginatedResponseDto, AxiosError<ErrorResponseData>>({
    queryKey: getProjectsQueryKey(params),
    queryFn: () =>
      api.projects
        .findProjectsHttpControllerFindUsers(params)
        .then(({ data }) => data),
    placeholderData: isKeepPreviousData ? keepPreviousData : undefined,
  });
};

export default useProjectsQuery;
