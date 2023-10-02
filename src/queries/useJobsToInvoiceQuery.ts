import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { format } from "date-fns";
import useApi from "@/hook/useApi";
import { LineItem } from "@/api";

const useJobsToInvoiceQuery = ({
  organizationId,
  servicePeriodMonth,
}: {
  organizationId: string;
  servicePeriodMonth: string;
}) => {
  const api = useApi();

  return useQuery<LineItem[], AxiosError<ErrorResponseData>>({
    queryKey: ["jobsToInvoice", "list", { organizationId, servicePeriodMonth }],
    queryFn: () =>
      api.jobsToInvoice
        .findJobToInvoiceHttpControllerFindJob({
          clientOrganizationId: organizationId,
          serviceMonth: format(new Date(servicePeriodMonth), "yyyy-MM"),
        })
        .then(({ data }) => data),
    enabled: organizationId !== "" && servicePeriodMonth !== "",
  });
};

export default useJobsToInvoiceQuery;
