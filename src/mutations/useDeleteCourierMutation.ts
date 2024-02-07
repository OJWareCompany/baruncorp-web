import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";

const useDeleteCourierMutation = () => {
  const api = useApi();

  return useMutation<
    void,
    AxiosError<ErrorResponseData>,
    { courierId: string }
  >(({ courierId }) => {
    return api.couriers
      .deleteCouriersHttpControllerPatch(courierId)
      .then(({ data: resData }) => resData);
  });
};

export default useDeleteCourierMutation;
