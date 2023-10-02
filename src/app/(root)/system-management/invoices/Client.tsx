"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/PageHeader";

interface Props {
  //   initialUsers: UserPaginatedResopnseDto | null;
}

export default function Client({}: Props) {
  const title = "Invoices";
  const router = useRouter();

  /**
   * State
   */
  //   const [pagination, setPagination] = usePagination(
  //     initialPagination.pageIndex,
  //     initialPagination.pageSize
  //   );

  /**
   * Query
   */
  //   const { data: users } = usePaginatedUsersQuery({
  //     pagination,
  //     initialData: initialUsers,
  //   });

  /**
   * Table
   */
  //   const userTableExportData = useMemo(
  //     () => getUserTableExportDataFromUsers(users),
  //     [users]
  //   );

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
      {/* <PaginatedTable
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
      /> */}
    </div>
  );
}
