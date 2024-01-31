import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { ExpensePricingResponseDto } from "@/api/api-spec";

export const getExpensePricingQueryKey = (
  organizationId: string,
  taskId: string
) => ["expense-pricings", "detail", organizationId, taskId];

const useExpensePricingQuery = (organizationId: string, taskId: string) => {
  const api = useApi();

  return useQuery<ExpensePricingResponseDto, AxiosError<ErrorResponseData>>({
    queryKey: getExpensePricingQueryKey(organizationId, taskId),
    queryFn: () =>
      api.expensePricings
        .findExpensePricingHttpControllerGet(taskId, organizationId)
        .then(({ data }) => data),
    enabled: organizationId !== "" && taskId !== "",
  });
};

export default useExpensePricingQuery;
