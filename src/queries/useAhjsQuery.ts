import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApiClient from "@/hook/useApiClient";
import { AhjsGetResDto } from "@/types/dto/ahjs";

export const QUERY_KEY = "ahjs";

const useAhjsQuery = () => {
  const apiClient = useApiClient();

  return useQuery<AhjsGetResDto, AxiosError<ErrorResponseData>>({
    queryKey: [QUERY_KEY],
    queryFn: () =>
      apiClient
        .get<AhjsGetResDto>("/geography/notes?pageNo=1") // TODO: Paginzation 적용해서 api 호출
        .then(({ data }) => data),
    refetchOnWindowFocus: false, // TODO: 이후에 모든 query에 적용할지 논의 필요
  });
};

export default useAhjsQuery;
