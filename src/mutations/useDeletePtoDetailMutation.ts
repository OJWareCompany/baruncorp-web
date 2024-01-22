import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";

const useDeletePtoDetailMutation = () => {
  const api = useApi();

  return useMutation<void, AxiosError<ErrorResponseData>, { ptoId: string }>(
    ({ ptoId }) => {
      return api.ptos
        .deletePtoDetailHttpControllerDelete(ptoId)
        .then(({ data: resData }) => resData);
    }
  );
};

export default useDeletePtoDetailMutation;
