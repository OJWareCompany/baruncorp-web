import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import {
  CreatableExpensePricingResponse,
  FindCreatableExpensePricingHttpControllerGetParams,
} from "@/api/api-spec";

export const getCreatableExpensePricingsQueryKey = (
  params: FindCreatableExpensePricingHttpControllerGetParams
) => ["creatable-expense-pricings", "list", params];

const useCreatableExpensePricingsQuery = (
  params: FindCreatableExpensePricingHttpControllerGetParams
) => {
  const api = useApi();

  return useQuery<
    CreatableExpensePricingResponse[],
    AxiosError<ErrorResponseData>
  >({
    queryKey: ["creatable-expense-pricings", "list", params],
    queryFn: () =>
      api.creatableExpensePricings
        .findCreatableExpensePricingHttpControllerGet(params)
        .then(({ data }) => data),
  });
};

export default useCreatableExpensePricingsQuery;
