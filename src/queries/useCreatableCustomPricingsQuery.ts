import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import {
  CreatableCustomPricingResponse,
  FindCreatableCustomPricingHttpControllerGetParams,
} from "@/api";

export const getCreatableCustomPricingsQueryKey = (
  params: FindCreatableCustomPricingHttpControllerGetParams
) => ["creatable-custom-pricings", "list", params];

const useCreatableCustomPricingsQuery = (
  params: FindCreatableCustomPricingHttpControllerGetParams
) => {
  const api = useApi();

  return useQuery<
    CreatableCustomPricingResponse[],
    AxiosError<ErrorResponseData>
  >({
    queryKey: getCreatableCustomPricingsQueryKey(params),
    queryFn: () =>
      api.creatableCustomPricings
        .findCreatableCustomPricingHttpControllerGet(params)
        .then(({ data }) => data),
  });
};

export default useCreatableCustomPricingsQuery;
