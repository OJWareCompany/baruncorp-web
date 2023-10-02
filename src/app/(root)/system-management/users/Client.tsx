"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { initialPagination } from "./constants";
import { UserPaginatedResopnseDto } from "@/api";
import { Button } from "@/components/ui/button";
import usePagination from "@/hook/usePagination";
import usePaginatedUsersQuery from "@/queries/usePaginatedUsersQuery";
import { getUserTableExportDataFromUsers, userColumns } from "@/columns/user";
import PaginatedTable from "@/components/table/PaginatedTable";
import PageHeader from "@/components/PageHeader";
interface Props {
  initialUsers: UserPaginatedResopnseDto | null;
}

export default function Client({ initialUsers }: Props) {
  const title = "Users";
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
  const { data: users } = usePaginatedUsersQuery({
    pagination,
    initialData: initialUsers,
  });

  /**
   * Table
   */
  const userTableExportData = useMemo(
    () => getUserTableExportDataFromUsers(users),
    [users]
  );

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        items={[{ href: "/system-management/users", name: title }]}
        title={title}
        action={
          <Button asChild size={"sm"}>
            <Link href="/system-management/users/new">New User</Link>
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
