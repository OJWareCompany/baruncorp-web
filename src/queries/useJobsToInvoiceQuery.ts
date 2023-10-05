import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { format } from "date-fns";
import useApi from "@/hook/useApi";
import { JobToInvoiceResponseDto } from "@/api";

const useJobsToInvoiceQuery = ({
  organizationId,
  servicePeriodMonth,
}: {
  organizationId: string;
  servicePeriodMonth: string;
}) => {
  const api = useApi();

  return useQuery<JobToInvoiceResponseDto, AxiosError<ErrorResponseData>>({
    queryKey: [
      "jobs-to-invoice",
      "list",
      { organizationId, servicePeriodMonth },
    ],
    queryFn: () =>
      api.jobsToInvoice
        .findJobToInvoiceHttpControllerFindJob({
          clientOrganizationId: organizationId,
          serviceMonth: format(
            new Date(servicePeriodMonth.slice(0, 7)),
            "yyyy-MM"
          ),
        })
        .then(({ data }) => data),
    enabled: organizationId !== "" && servicePeriodMonth !== "",
    keepPreviousData: organizationId !== "" && servicePeriodMonth !== "",
  });
};

export default useJobsToInvoiceQuery;
