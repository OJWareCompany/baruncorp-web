"use client";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserResponseDto } from "@/api";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import useDeleteUserAvailableTaskMutation from "@/mutations/useDeleteUserAvailableTaskMutation";
import { getUserQueryKey } from "@/queries/useUserQuery";

const columnHelper =
  createColumnHelper<UserResponseDto["availableTasks"][number]>();

interface Props {
  user: UserResponseDto;
}

export default function AvailableTasksTable({ user }: Props) {
  const router = useRouter();
  const { mutateAsync } = useDeleteUserAvailableTaskMutation();
  const queryClient = useQueryClient();
  // const pathname = usePathname();
  // const searchParams = useSearchParams();

  // const pagination: PaginationState = {
  //   pageIndex: searchParams.get("pageIndex")
  //     ? Number(searchParams.get("pageIndex"))
  //     : 0,
  //   pageSize: searchParams.get("pageSize")
  //     ? Number(searchParams.get("pageSize"))
  //     : 10,
  // };
  // const typeSearchParam =
  //   (searchParams.get("type") as TLicenseTypeEnum) ??
  //   LicenseTypeEnum.Values.Structural;

  // const { data, isLoading } = useLicensesQuery(
  //   {
  //     page: pagination.pageIndex + 1,
  //     limit: pagination.pageSize,
  //     type: typeSearchParam,
  //   },
  //   true
  // );

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Name",
      }),
      columnHelper.accessor("autoAssignmentType", {
        header: "Auto Assignment Property Type",
      }),
      columnHelper.display({
        id: "action",
        cell: ({ row }) => {
          return (
            <div className="text-right">
              <div
                className="inline-flex"
                onClick={(event) => {
                  event.stopPropagation();
                }}
              >
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant={"ghost"} size={"icon"} className="h-9 w-9">
                      <X className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          mutateAsync({
                            userId: user.id,
                            taskId: row.original.id,
                          }).then(() => {
                            queryClient.invalidateQueries({
                              queryKey: getUserQueryKey(user.id),
                            });
                          });
                        }}
                      >
                        Continue
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          );
        },
      }),
    ],
    [mutateAsync, queryClient, user.id]
  );

  const table = useReactTable({
    data: user.availableTasks,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: ({ id }) => id,
  });

  return (
    <div className="space-y-2">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() => {
                    router.push(`/system-management/tasks/${row.id}`);
                  }}
                  className="cursor-pointer"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
