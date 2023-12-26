import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import { FindLicenseHttpControllerGetParams, LicenseResponseDto } from "@/api";
import { LicenseTypeEnum } from "@/lib/constants";

export const getLicenseQueryKey = (
  params: FindLicenseHttpControllerGetParams
) => ["licenses", "detail", params];

const useLicenseQuery = (params: FindLicenseHttpControllerGetParams) => {
  const api = useApi();

  return useQuery<LicenseResponseDto, AxiosError<ErrorResponseData>>({
    queryKey: getLicenseQueryKey(params),
    queryFn: () =>
      api.licenses
        .findLicenseHttpControllerGet(params)
        .then(({ data }) => data),
    enabled:
      (params.type === LicenseTypeEnum.Values.Electrical ||
        params.type === LicenseTypeEnum.Values.Structural) &&
      params.abbreviation !== "",
  });
};

export default useLicenseQuery;
