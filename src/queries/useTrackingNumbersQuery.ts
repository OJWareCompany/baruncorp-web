import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import {
  FindTrackingNumbersPaginatedHttpControllerGetParams,
  TrackingNumbersPaginatedResponseDto,
} from "@/api/api-spec";

export const getTrackingNumbersQueryKey = (
  params: FindTrackingNumbersPaginatedHttpControllerGetParams
) => ["tracking-numbers", "list", params];

const useTrackingNumbersQuery = (
  params: FindTrackingNumbersPaginatedHttpControllerGetParams,
  keepPreviousData?: boolean
) => {
  const api = useApi();

  return useQuery<
    TrackingNumbersPaginatedResponseDto,
    AxiosError<ErrorResponseData>
  >({
    queryKey: getTrackingNumbersQueryKey(params),
    queryFn: () =>
      api.trackingNumbers
        .findTrackingNumbersPaginatedHttpControllerGet(params)
        .then(({ data }) => data),
    keepPreviousData,
  });
};

export default useTrackingNumbersQuery;
