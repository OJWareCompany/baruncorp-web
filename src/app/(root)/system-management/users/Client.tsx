"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { initialPagination } from "./constants";

import { UserPaginatedResopnseDto } from "@/api";
import { Button } from "@/components/ui/button";
import usePagination from "@/hook/usePagination";
import usePaginatedUsersQuery from "@/queries/usePaginatedUsersQuery";
import { UserTableRowData, userTableColumns } from "@/columns/user";
import PaginatedTable from "@/components/table/PaginatedTable";
import PageHeader from "@/components/PageHeader";
interface Props {
  initialUsers: UserPaginatedResopnseDto | null;
}

export default function Client({ initialUsers }: Props) {
  const router = useRouter();
  const [pagination, setPagination] = usePagination(
    initialPagination.pageIndex,
    initialPagination.pageSize
  );

  const { data: users } = usePaginatedUsersQuery({
    pagination,
    initialData: initialUsers,
  });

  const userTableData = useMemo(
    () =>
      users?.items.map<UserTableRowData>((value) => {
        const { email, fullName, id, organization, phoneNumber } = value;

        return {
          email,
          fullName,
          id,
          organization,
          phoneNumber,
        };
      }),
    [users?.items]
  );

  const title = "Users";

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
        columns={userTableColumns}
        data={userTableData ?? []}
        pageCount={users?.totalPage ?? -1}
        pagination={pagination}
        onPaginationChange={setPagination}
        onRowClick={(id) => {
          router.push(`/system-management/users/${id}`);
        }}
      />
    </div>
  );
}
