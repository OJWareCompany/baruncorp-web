import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import {
  FindJobToInvoiceHttpControllerFindJobParams,
  JobToInvoiceResponseDto,
} from "@/api";

export const getJobsToInvoiceQueryKey = (
  params: FindJobToInvoiceHttpControllerFindJobParams
) => ["jobs-to-invoice", "list", params];

const useJobsToInvoiceQuery = (
  params: FindJobToInvoiceHttpControllerFindJobParams
) => {
  const api = useApi();

  return useQuery<JobToInvoiceResponseDto, AxiosError<ErrorResponseData>>({
    queryKey: getJobsToInvoiceQueryKey(params),
    queryFn: () =>
      api.jobsToInvoice
        .findJobToInvoiceHttpControllerFindJob(params)
        .then(({ data }) => data),
  });
};

export default useJobsToInvoiceQuery;
