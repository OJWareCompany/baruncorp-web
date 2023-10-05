"use client";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { initialPagination } from "./constants";
import usePagination from "@/hook/usePagination";
import usePaginatedPaymentsQuery from "@/queries/usePaginatedPaymentsQuery";
import PaginatedTable from "@/components/table/PaginatedTable";
import PageHeader from "@/components/PageHeader";
import PageLoading from "@/components/PageLoading";
import {
  getPaymentPaginatedColumns,
  getPaymentTableExportDataFromPayments,
} from "@/columns/payment";

const title = "Payments";

export default function Page() {
  const router = useRouter();

  /**
   * State
   */
  const [pagination, setPagination] = usePagination(
    initialPagination.pageIndex,
    initialPagination.pageSize
  );

  /**
   * Query
   */
  const { data: payments, isLoading: isPaymentsQueryLoading } =
    usePaginatedPaymentsQuery({
      pagination,
    });

  /**
   * Table
   */
  const paymentTableExportData = useMemo(
    () => getPaymentTableExportDataFromPayments(payments),
    [payments]
  );

  if (isPaymentsQueryLoading) {
    return <PageLoading />;
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        items={[{ href: "/system-management/payments", name: title }]}
        title={title}
      />
      <PaginatedTable
        columns={getPaymentPaginatedColumns(pagination)}
        data={payments?.items ?? []}
        exportData={paymentTableExportData ?? []}
        exportFileName={title}
        pageCount={payments?.totalPage ?? -1}
        pagination={pagination}
        onPaginationChange={setPagination}
        getRowId={({ id }) => id}
      />
    </div>
  );
}
