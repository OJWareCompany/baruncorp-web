import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import {
  FindCouriersPaginatedHttpControllerGetParams,
  CouriersPaginatedResponseDto,
} from "@/api/api-spec";

export const getCouriersQueryKey = (
  params: FindCouriersPaginatedHttpControllerGetParams
) => ["couriers", "list", params];

const useCouriersQuery = (
  params: FindCouriersPaginatedHttpControllerGetParams,
  isKeepPreviousData?: boolean
) => {
  const api = useApi();

  return useQuery<CouriersPaginatedResponseDto, AxiosError<ErrorResponseData>>({
    queryKey: getCouriersQueryKey(params),
    queryFn: () =>
      api.couriers
        .findCouriersPaginatedHttpControllerGet(params)
        .then(({ data }) => data),
    placeholderData: isKeepPreviousData ? keepPreviousData : undefined,
  });
};

export default useCouriersQuery;
