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
import { AxiosError } from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserResponseDto } from "@/api/api-spec";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import {
  AutoAssignmentPropertyTypeEnum,
  BARUNCORP_ORGANIZATION_ID,
} from "@/lib/constants";
import usePatchUserAvailableTaskMutation from "@/mutations/usePatchUserAvailableTaskMutation";

const columnHelper =
  createColumnHelper<UserResponseDto["availableTasks"][number]>();

interface Props {
  user: UserResponseDto;
}

export default function AvailableTasksTable({ user }: Props) {
  const { toast } = useToast();
  const router = useRouter();
  const { mutateAsync: deleteUserAvailableTaskMutateAsync } =
    useDeleteUserAvailableTaskMutation();
  const { mutateAsync: patchUserAvailableTaskMutateAsync } =
    usePatchUserAvailableTaskMutation(user.id);
  const queryClient = useQueryClient();

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Name",
      }),
      columnHelper.accessor("licenseType", {
        header: "License Type",
        cell: ({ getValue }) => {
          const value = getValue();

          if (value == null) {
            return <p className="text-muted-foreground">-</p>;
          }

          return value;
        },
      }),
      columnHelper.accessor("autoAssignmentType", {
        header: "Auto Assignment Property Type",
        cell: ({ getValue, row }) => {
          return (
            <Select
              value={getValue()}
              onValueChange={(newValue) => {
                patchUserAvailableTaskMutateAsync({
                  taskId: row.original.id,
                  autoAssignmentType:
                    newValue as AutoAssignmentPropertyTypeEnum,
                })
                  .then(() => {
                    toast({
                      title: "Success",
                    });
                    queryClient.invalidateQueries({
                      queryKey: getUserQueryKey(user.id),
                    });
                  })
                  .catch((error: AxiosError<ErrorResponseData>) => {
                    if (
                      error.response &&
                      error.response.data.errorCode.filter(
                        (value) => value != null
                      ).length !== 0
                    ) {
                      toast({
                        title: error.response.data.message,
                        variant: "destructive",
                      });
                      return;
                    }
                  });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a property type" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {AutoAssignmentPropertyTypeEnum.options.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          );
        },
      }),
      columnHelper.display({
        id: "action",
        cell: ({ row }) => {
          if (row.original.licenseType != null) {
            return;
          }

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
                          deleteUserAvailableTaskMutateAsync({
                            userId: user.id,
                            taskId: row.original.id,
                          })
                            .then(() => {
                              queryClient.invalidateQueries({
                                queryKey: getUserQueryKey(user.id),
                              });
                            })
                            .catch((error: AxiosError<ErrorResponseData>) => {
                              if (
                                error.response &&
                                error.response.data.errorCode.filter(
                                  (value) => value != null
                                ).length !== 0
                              ) {
                                toast({
                                  title: error.response.data.message,
                                  variant: "destructive",
                                });
                                return;
                              }
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
    [
      deleteUserAvailableTaskMutateAsync,
      patchUserAvailableTaskMutateAsync,
      queryClient,
      toast,
      user.id,
    ]
  );

  const table = useReactTable({
    data: user.availableTasks,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: ({ id }) => id,
    state: {
      columnVisibility: {
        autoAssignmentType: user.organizationId === BARUNCORP_ORGANIZATION_ID,
      },
    },
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
