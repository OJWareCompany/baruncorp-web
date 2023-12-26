import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { IdResponse, RevokeUserLicenseHttpControllerPostParams } from "@/api";

const useDeleteUserLicenseMutation = () => {
  const api = useApi();

  return useMutation<
    IdResponse,
    AxiosError<ErrorResponseData>,
    RevokeUserLicenseHttpControllerPostParams
  >((reqData) => {
    return api.licenses
      .revokeUserLicenseHttpControllerPost(reqData)
      .then(({ data: resData }) => resData);
  });
};

export default useDeleteUserLicenseMutation;
