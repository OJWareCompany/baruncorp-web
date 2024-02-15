import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { AppointUserLicenseRequestDto } from "@/api/api-spec";

interface Variables extends AppointUserLicenseRequestDto {
  abbreviation: string;
}

const usePostUserLicenseMutation = () => {
  const api = useApi();

  return useMutation<void, AxiosError<ErrorResponseData>, Variables>({
    mutationFn: (reqData) => {
      return api.licenses
        .appointUserLicenseHttpControllerPost(reqData.abbreviation, reqData)
        .then(({ data: resData }) => resData);
    },
  });
};

export default usePostUserLicenseMutation;
