import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";

const useDeleteScopeMutation = (scopeId: string) => {
  const api = useApi();

  return useMutation<void, AxiosError<ErrorResponseData>>({
    mutationFn: () => {
      return api.services
        .deleteServiceHttpControllerDelete(scopeId)
        .then(({ data: resData }) => resData);
    },
  });
};

export default useDeleteScopeMutation;
