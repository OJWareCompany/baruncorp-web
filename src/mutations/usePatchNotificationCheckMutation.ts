import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";

const usePatchNotificationCheckMutation = () => {
  const api = useApi();

  return useMutation<
    void,
    AxiosError<ErrorResponseData>,
    {
      assigningTaskAlertId: string;
    }
  >({
    mutationFn: (reqData) => {
      return api.assigningTaskAlerts
        .checkOutAssigningTaskAlertHttpControllerCheckOut(
          reqData.assigningTaskAlertId
        )
        .then(({ data: resData }) => resData);
    },
  });
};

export default usePatchNotificationCheckMutation;
