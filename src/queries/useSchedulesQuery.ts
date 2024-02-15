import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import {
  FindSchedulePaginatedHttpControllerGetParams,
  SchedulePaginatedResponseDto,
} from "@/api/api-spec";

export const getSchedulesQueryKey = (
  params: FindSchedulePaginatedHttpControllerGetParams
) => ["schedules", "list", params];

const useSchedulesQuery = (
  params: FindSchedulePaginatedHttpControllerGetParams,
  isKeepPreviousData?: boolean
) => {
  const api = useApi();

  return useQuery<SchedulePaginatedResponseDto, AxiosError<ErrorResponseData>>({
    queryKey: getSchedulesQueryKey(params),
    queryFn: () =>
      api.users
        .findSchedulePaginatedHttpControllerGet(params)
        .then(({ data }) => data),
    placeholderData: isKeepPreviousData ? keepPreviousData : undefined,
  });
};

export default useSchedulesQuery;
