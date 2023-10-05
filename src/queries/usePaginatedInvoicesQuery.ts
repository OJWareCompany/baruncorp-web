import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { PaginationState } from "@tanstack/react-table";
import useApi from "@/hook/useApi";
import { InvoicePaginatedResponseDto } from "@/api";

interface Props {
  pagination: PaginationState;
}

const usePaginatedInvoicesQuery = ({
  pagination: { pageIndex, pageSize },
}: Props) => {
  const api = useApi();

  return useQuery<InvoicePaginatedResponseDto, AxiosError<ErrorResponseData>>({
    queryKey: ["projects", "list", { pageIndex, pageSize }],
    queryFn: () =>
      api.invoices
        .findInvoicePaginatedHttpControllerGet({
          page: pageIndex + 1,
          limit: pageSize,
        })
        .then(({ data }) => data),
    keepPreviousData: true,
  });
};

export default usePaginatedInvoicesQuery;
