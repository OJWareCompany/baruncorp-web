import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { AddressFromMapBox, CensusResponseDto } from "@/api/api-spec";

const usePostAhjMutation = () => {
  const api = useApi();

  return useMutation<
    CensusResponseDto,
    AxiosError<ErrorResponseData>,
    AddressFromMapBox
  >({
    mutationFn: (reqData) => {
      return api.searchCensus
        .searchCensusHttpControllerPostSearchCensus(reqData)
        .then(({ data: resData }) => resData);
    },
  });
};

export default usePostAhjMutation;
