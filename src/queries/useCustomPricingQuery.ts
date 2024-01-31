import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { CustomPricingResponseDto } from "@/api/api-spec";

export const getCustomPricingQueryKey = (
  organizationId: string,
  serviceId: string
) => ["custom-pricings", "detail", organizationId, serviceId];

const useCustomPricingQuery = (organizationId: string, serviceId: string) => {
  const api = useApi();

  return useQuery<CustomPricingResponseDto, AxiosError<ErrorResponseData>>({
    queryKey: ["custom-pricings", "detail", organizationId, serviceId],
    queryFn: () =>
      api.customPricings
        .findCustomPricingHttpControllerGet(organizationId, serviceId)
        .then(({ data }) => data),
    enabled: organizationId !== "" && serviceId !== "",
  });
};

export default useCustomPricingQuery;
