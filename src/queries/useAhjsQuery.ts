import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApiClient from "@/hook/useApiClient";
import { AhjsGetResDto } from "@/types/dto/ahjs";

export const QUERY_KEY = "ahjs";

const useAhjsQuery = () => {
  const apiClient = useApiClient();

  return useQuery<AhjsGetResDto, AxiosError<ErrorResponseData>>({
    queryKey: [QUERY_KEY],
    // queryFn: () =>
    //     apiClient
    //         .get<AhjsGetResDto>("/geography/notes")
    //         .then(({ data }) => data),
    queryFn: () => {
      return [
        {
          id: "1",
          name: "hello world",
          modifiedBy: "dfaf",
        },
        {
          id: "12",
          name: "hello world",
          modifiedBy: "dfaf",
        },
        {
          id: "123",
          name: "hello world",
          modifiedBy: "dfaf",
        },
      ];
    },
    refetchOnWindowFocus: false, // TODO: 이후에 모든 query에 적용할지 논의 필요
  });
};

export default useAhjsQuery;
