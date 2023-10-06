"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { Plus } from "lucide-react";
import { initialPagination } from "./constants";
import { Button } from "@/components/ui/button";
import usePagination from "@/hook/usePagination";
import usePaginatedUsersQuery from "@/queries/usePaginatedUsersQuery";
import { getUserTableExportDataFromUsers, userColumns } from "@/columns/user";
import PaginatedTable from "@/components/table/PaginatedTable";
import PageHeader from "@/components/PageHeader";
import PageLoading from "@/components/PageLoading";

const title = "Users";

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
  const { data: users, isLoading: isUsersQueryLoading } =
    usePaginatedUsersQuery({
      pagination,
    });

  /**
   * Table
   */
  const userTableExportData = useMemo(
    () => getUserTableExportDataFromUsers(users),
    [users]
  );

  if (isUsersQueryLoading) {
    return <PageLoading />;
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        items={[{ href: "/system-management/users", name: title }]}
        title={title}
        action={
          <Button asChild size={"sm"} variant={"outline"}>
            <Link href="/system-management/users/new">
              <Plus className="mr-2 h-4 w-4" />
              New User
            </Link>
          </Button>
        }
      />
      <PaginatedTable
        columns={userColumns}
        data={users?.items ?? []}
        exportData={userTableExportData ?? []}
        exportFileName={title}
        pageCount={users?.totalPage ?? -1}
        pagination={pagination}
        onPaginationChange={setPagination}
        onRowClick={(id) => {
          router.push(`/system-management/users/${id}`);
        }}
        getRowId={({ id }) => id}
      />
    </div>
  );
}
