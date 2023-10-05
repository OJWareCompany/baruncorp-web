"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { initialPagination } from "./constants";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/PageHeader";
import usePaginatedInvoicesQuery from "@/queries/usePaginatedInvoicesQuery";
import usePagination from "@/hook/usePagination";
import PaginatedTable from "@/components/table/PaginatedTable";
import {
  getInvoiceTableExportDataFromInvoices,
  invoiceColumns,
} from "@/columns/invoice";
import PageLoading from "@/components/PageLoading";

const title = "Invoices";

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
  const { data: invoices, isLoading: isInvoicesQueryLoading } =
    usePaginatedInvoicesQuery({
      pagination,
    });

  /**
   * Table
   */
  const invoiceTableExportData = useMemo(
    () => getInvoiceTableExportDataFromInvoices(invoices),
    [invoices]
  );

  if (isInvoicesQueryLoading) {
    return <PageLoading />;
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        items={[{ href: "/system-management/invoices", name: title }]}
        title={title}
        action={
          <Button asChild size={"sm"}>
            <Link href="/system-management/invoices/new">New Invoice</Link>
          </Button>
        }
      />
      <PaginatedTable
        columns={invoiceColumns}
        data={invoices?.items ?? []}
        exportData={invoiceTableExportData ?? []}
        exportFileName={title}
        pageCount={invoices?.totalPage ?? -1}
        pagination={pagination}
        onPaginationChange={setPagination}
        onRowClick={(id) => {
          router.push(`/system-management/invoices/${id}`);
        }}
        getRowId={({ id }) => id}
      />
    </div>
  );
}
