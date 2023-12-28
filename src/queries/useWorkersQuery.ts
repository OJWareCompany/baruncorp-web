import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { PositionUnregisteredUserResponseDto } from "@/api";

export const getWorkersQueryKey = () => ["workers", "list"];

const useWorkersQuery = () => {
  const api = useApi();

  return useQuery<
    PositionUnregisteredUserResponseDto,
    AxiosError<ErrorResponseData>
  >({
    queryKey: getWorkersQueryKey(),
    queryFn: () =>
      api.licenses
        .findLicensableWorkersHttpControllerGet()
        .then(({ data }) => data),
  });
};

export default useWorkersQuery;
