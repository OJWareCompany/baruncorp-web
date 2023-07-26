import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApiClient from "@/hook/useApiClient";
import { AhjHistoriesGetResDto } from "@/types/dto/ahjs";

export const QUERY_KEY = "ahjHistories";

const useAhjHistoriesQuery = (geoId: string) => {
  const apiClient = useApiClient();

  return useQuery<AhjHistoriesGetResDto, AxiosError<ErrorResponseData>>({
    queryKey: [QUERY_KEY, geoId],
    queryFn: () =>
      apiClient
        .get<AhjHistoriesGetResDto>("/geography/notes/history", {
          params: {
            pageNo: 1,
            geoId,
          },
        }) // TODO: pagination 적용
        .then(({ data }) => data),
  });
};

export default useAhjHistoriesQuery;
