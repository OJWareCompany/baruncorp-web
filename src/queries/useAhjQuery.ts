import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApiClient from "@/hook/useApiClient";
import { AhjGetResDto } from "@/types/dto/ahjs";

export const QUERY_KEY = "ahj";

export const useAhjQuery = (geoId: string) => {
  const apiClient = useApiClient();

  return useQuery<AhjGetResDto, AxiosError<ErrorResponseData>>({
    queryKey: [QUERY_KEY, geoId],
    queryFn: () =>
      apiClient
        .get<AhjGetResDto>(`/geography/${geoId}/notes`)
        .then(({ data }) => data),
    refetchOnWindowFocus: false,
  });
};
