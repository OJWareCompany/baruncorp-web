import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { AddressFromMapBox, CensusResponseDto } from "@/api/api-spec";

export const getAhjsQueryKey = (
  coordinates: AddressFromMapBox["coordinates"]
) => {
  const [longitude, latitude] = coordinates;
  return ["ahjs", "list", longitude, latitude];
};

const useAhjsQuery = (
  data: AddressFromMapBox,
  isKeepPreviousData?: boolean
) => {
  const api = useApi();

  return useQuery<CensusResponseDto, AxiosError<ErrorResponseData>>({
    queryKey: getAhjsQueryKey(data.coordinates),
    queryFn: () =>
      api.searchCensus
        .findSearchCensusHttpControllerSearchCensus(data)
        .then(({ data }) => data),
    placeholderData: isKeepPreviousData ? keepPreviousData : undefined,
  });
};

export default useAhjsQuery;
