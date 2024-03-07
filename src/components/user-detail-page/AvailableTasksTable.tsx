"use client";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
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
import { OrganizationResponseDto, UserResponseDto } from "@/api/api-spec";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
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
import { AutoAssignmentPropertyTypeEnum } from "@/lib/constants";
import usePatchUserAvailableTaskMutation from "@/mutations/usePatchUserAvailableTaskMutation";
import LoadingButton from "@/components/LoadingButton";
import { useProfileContext } from "@/app/(root)/ProfileProvider";
import { cn } from "@/lib/utils";

const columnHelper =
  createColumnHelper<UserResponseDto["availableTasks"][number]>();

interface Props {
  user: UserResponseDto;
  organization: OrganizationResponseDto;
}

export default function AvailableTasksTable({ user, organization }: Props) {
  const { toast } = useToast();
  const router = useRouter();
  const {
    mutateAsync: deleteUserAvailableTaskMutateAsync,
    isPending: isDeleteUserAvailableTaskMutationPending,
  } = useDeleteUserAvailableTaskMutation();
  const { mutateAsync: patchUserAvailableTaskMutateAsync } =
    usePatchUserAvailableTaskMutation(user.id);
  const queryClient = useQueryClient();
  const [alertDialogState, setAlertDialogState] = useState<
    { open: false } | { open: true; taskId: string }
  >({ open: false });

  const { isBarunCorpMember } = useProfileContext();

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
              <SelectTrigger className="-ml-[9px] text-xs px-2 h-8 py-0 focus:ring-0 focus:ring-offset-0">
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
                <Button
                  variant={"ghost"}
                  size={"icon"}
                  className="h-8 w-8"
                  onClick={() => {
                    setAlertDialogState({ open: true, taskId: row.id });
                  }}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          );
        },
      }),
    ],
    [patchUserAvailableTaskMutateAsync, queryClient, toast, user.id]
  );

  const isTargetUserOrganizationBarunCorp =
    organization.organizationType.toUpperCase() === "ADMINISTRATION";

  const table = useReactTable({
    data: user.availableTasks,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: ({ id }) => id,
    state: {
      columnVisibility: {
        autoAssignmentType: isTargetUserOrganizationBarunCorp,
      },
    },
  });

  return (
    <>
      <div className="space-y-2">
        <div className="rounded-md border overflow-hidden">
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
                      if (isBarunCorpMember) {
                        router.push(`/system-management/tasks/${row.id}`);
                      }
                    }}
                    className={cn(isBarunCorpMember && "cursor-pointer")}
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
      <AlertDialog
        open={alertDialogState.open}
        onOpenChange={(newOpen) => {
          if (newOpen) {
            return;
          }

          setAlertDialogState({ open: newOpen });
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <LoadingButton
              isLoading={isDeleteUserAvailableTaskMutationPending}
              onClick={() => {
                if (!alertDialogState.open) {
                  return;
                }

                deleteUserAvailableTaskMutateAsync({
                  userId: user.id,
                  taskId: alertDialogState.taskId,
                })
                  .then(() => {
                    toast({ title: "Success" });
                    queryClient.invalidateQueries({
                      queryKey: getUserQueryKey(user.id),
                    });
                    setAlertDialogState({ open: false });
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
            </LoadingButton>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
