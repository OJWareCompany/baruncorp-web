// import { useQuery } from "@tanstack/react-query";
// import { AxiosError } from "axios";
// import { PaginationState } from "@tanstack/react-table";
// import useApi from "@/hook/useApi";
// import { PaymentPaginatedResponseDto } from "@/api";

// interface Props {
//   pagination: PaginationState;
// }

// const usePaginatedPaymentsQuery = ({
//   pagination: { pageIndex, pageSize },
// }: Props) => {
//   const api = useApi();

//   return useQuery<PaymentPaginatedResponseDto, AxiosError<ErrorResponseData>>({
//     queryKey: ["payments", "list", { pageIndex, pageSize }],
//     queryFn: () =>
//       api.payments
//         .findPaymentPaginatedHttpControllerGet({
//           page: pageIndex + 1,
//           limit: pageSize,
//         })
//         .then(({ data }) => data),
//     keepPreviousData: true,
//   });
// };

// export default usePaginatedPaymentsQuery;
