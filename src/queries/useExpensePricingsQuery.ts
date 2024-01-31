import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import {
  ExpensePricingPaginatedResponseDto,
  FindExpensePricingPaginatedHttpControllerGetParams,
} from "@/api/api-spec";

export const getExpensePricingsQueryKey = (
  params: FindExpensePricingPaginatedHttpControllerGetParams
) => ["expense-pricings", "list", params];

const useExpensePricingsQuery = (
  params: FindExpensePricingPaginatedHttpControllerGetParams
) => {
  const api = useApi();

  return useQuery<
    ExpensePricingPaginatedResponseDto,
    AxiosError<ErrorResponseData>
  >({
    queryKey: getExpensePricingsQueryKey(params),
    queryFn: () =>
      api.expensePricings
        .findExpensePricingPaginatedHttpControllerGet(params)
        .then(({ data }) => data),
  });
};

export default useExpensePricingsQuery;
