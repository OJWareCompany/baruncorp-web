import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { UtilityResponseDto } from "@/api/api-spec";

export const getUtilityQueryKey = (utilityId: string) => [
  "utilities",
  "detail",
  utilityId,
];

const useUtilityQuery = (utilityId: string) => {
  const api = useApi();

  return useQuery<UtilityResponseDto, AxiosError<ErrorResponseData>>({
    queryKey: getUtilityQueryKey(utilityId),
    queryFn: () =>
      api.utilities
        .findUtilityHttpControllerGet(utilityId)
        .then(({ data }) => data),
    enabled: utilityId !== "",
  });
};

export default useUtilityQuery;
