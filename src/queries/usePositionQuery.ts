import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { PositionResponseDto } from "@/api";

export const getPositionQueryKey = (positionId: string) => [
  "positions",
  "detail",
  positionId,
];

const usePositionQuery = (positionId: string) => {
  const api = useApi();

  return useQuery<PositionResponseDto, AxiosError<ErrorResponseData>>({
    queryKey: getPositionQueryKey(positionId),
    queryFn: () =>
      api.positions
        .findPositionHttpControllerGet(positionId)
        .then(({ data }) => data),
    enabled: positionId !== "",
  });
};

export default usePositionQuery;
