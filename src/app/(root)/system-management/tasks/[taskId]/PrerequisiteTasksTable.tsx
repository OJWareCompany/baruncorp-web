"use client";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
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
import { TaskResponseDto } from "@/api/api-spec";
import { Button } from "@/components/ui/button";
import useDeletePrerequisiteTaskMutation from "@/mutations/useDeletePrerequisiteTaskMutation";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getTaskQueryKey } from "@/queries/useTaskQuery";
import { useToast } from "@/components/ui/use-toast";
import LoadingButton from "@/components/LoadingButton";

const columnHelper =
  createColumnHelper<TaskResponseDto["prerequisiteTask"][number]>();

interface Props {
  task: TaskResponseDto;
}

export default function PrerequisiteTasksTable({ task }: Props) {
  const router = useRouter();
  const { mutateAsync, isPending } = useDeletePrerequisiteTaskMutation(task.id);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [alertDialogState, setAlertDialogState] = useState<
    { open: false } | { open: true; taskId: string }
  >({ open: false });

  const columns = useMemo(
    () => [
      columnHelper.accessor("taskName", {
        header: "Name",
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
                <Button
                  variant={"ghost"}
                  size={"icon"}
                  className="h-9 w-9"
                  onClick={() => {
                    setAlertDialogState({ open: true, taskId: row.id });
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          );
        },
      }),
    ],
    []
  );

  const table = useReactTable({
    data: task.prerequisiteTask,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: ({ taskId }) => taskId,
  });

  return (
    <>
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
              isLoading={isPending}
              onClick={() => {
                if (!alertDialogState.open) {
                  return;
                }

                mutateAsync({
                  prerequisiteTaskId: alertDialogState.taskId,
                })
                  .then(() => {
                    toast({ title: "Success" });
                    queryClient.invalidateQueries({
                      queryKey: getTaskQueryKey(task.id),
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
