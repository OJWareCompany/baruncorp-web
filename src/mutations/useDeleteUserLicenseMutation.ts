import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { RevokeUserLicenseHttpControllerPostParams } from "@/api/api-spec";

const useDeleteUserLicenseMutation = () => {
  const api = useApi();

  return useMutation<
    void,
    AxiosError<ErrorResponseData>,
    RevokeUserLicenseHttpControllerPostParams
  >((reqData) => {
    return api.licenses
      .revokeUserLicenseHttpControllerPost(reqData)
      .then(({ data: resData }) => resData);
  });
};

export default useDeleteUserLicenseMutation;
