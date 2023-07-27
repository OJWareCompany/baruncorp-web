import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { AhjGetResDto } from "@/types/dto/ahjs";

export const QUERY_KEY = "ahj";

export const useAhjQuery = (geoId: string) => {
  const api = useApi();

  return useQuery<AhjGetResDto, AxiosError<ErrorResponseData>>({
    queryKey: [QUERY_KEY, geoId],
    queryFn: () =>
      api
        .get<AhjGetResDto>(`/geography/${geoId}/notes`)
        .then(({ data }) => data),
  });
};
