import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { HandsStatusResponseDto } from "@/api/api-spec";

export const getHandsStatusQueryKey = () => ["handStatus"];

const useHandsStatusQuery = () => {
  const api = useApi();

  return useQuery<HandsStatusResponseDto, AxiosError<ErrorResponseData>>({
    queryKey: getHandsStatusQueryKey(),
    queryFn: () =>
      api.users.checkHandsStatusHttpControllerGet().then(({ data }) => data),
  });
};

export default useHandsStatusQuery;
