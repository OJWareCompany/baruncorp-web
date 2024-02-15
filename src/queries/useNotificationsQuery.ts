import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import {
  AssigningTaskAlertPaginatedResponse,
  FindAssigningTaskAlertPaginatedHttpControllerFindParams,
} from "@/api/api-spec";

export const getNotificationsQueryKey = (
  params: FindAssigningTaskAlertPaginatedHttpControllerFindParams
) => ["notifications", "list", params];

const useNotificationsQuery = (
  params: FindAssigningTaskAlertPaginatedHttpControllerFindParams,
  isKeepPreviousData?: boolean
) => {
  const api = useApi();

  return useQuery<
    AssigningTaskAlertPaginatedResponse,
    AxiosError<ErrorResponseData>
  >({
    queryKey: getNotificationsQueryKey(params),
    queryFn: () =>
      api.assigningTaskAlerts
        .findAssigningTaskAlertPaginatedHttpControllerFind(params)
        .then(({ data }) => data),
    placeholderData: isKeepPreviousData ? keepPreviousData : undefined,
  });
};

export default useNotificationsQuery;
