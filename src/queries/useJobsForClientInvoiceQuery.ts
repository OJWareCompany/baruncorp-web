import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import {
  FindJobToInvoiceHttpControllerFindJobParams,
  JobToInvoiceResponseDto,
} from "@/api/api-spec";

export const getJobsForClientInvoiceQueryKey = (
  params: FindJobToInvoiceHttpControllerFindJobParams
) => ["jobs-for-client-invoice", "list", params];

const useJobsForClientInvoiceQuery = (
  params: FindJobToInvoiceHttpControllerFindJobParams,
  isKeepPreviousData?: boolean
) => {
  const api = useApi();

  return useQuery<JobToInvoiceResponseDto, AxiosError<ErrorResponseData>>({
    queryKey: getJobsForClientInvoiceQueryKey(params),
    queryFn: () =>
      api.jobsToInvoice
        .findJobToInvoiceHttpControllerFindJob(params)
        .then(({ data }) => data),
    enabled: params.clientOrganizationId !== "" && params.serviceMonth !== "",
    placeholderData: isKeepPreviousData ? keepPreviousData : undefined,
  });
};

export default useJobsForClientInvoiceQuery;
