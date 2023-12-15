import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import {
  CustomPricingPaginatedResponseDto,
  FindCustomPricingPaginatedHttpControllerGetParams,
} from "@/api";

export const getCustomPricingsQueryKey = (
  params: FindCustomPricingPaginatedHttpControllerGetParams
) => ["custom-pricings", "list", params];

const useCustomPricingsQuery = (
  params: FindCustomPricingPaginatedHttpControllerGetParams
) => {
  const api = useApi();

  return useQuery<
    CustomPricingPaginatedResponseDto,
    AxiosError<ErrorResponseData>
  >({
    queryKey: getCustomPricingsQueryKey(params),
    queryFn: () =>
      api.customPricings
        .findCustomPricingPaginatedHttpControllerGet(params)
        .then(({ data }) => data),
  });
};

export default useCustomPricingsQuery;
