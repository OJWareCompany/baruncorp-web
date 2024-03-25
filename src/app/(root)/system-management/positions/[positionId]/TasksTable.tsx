import { X } from "lucide-react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { PositionResponseDto } from "@/api/api-spec";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import useDeletePositionTaskMutation from "@/mutations/useDeletePositionTaskMutation";
import { getPositionQueryKey } from "@/queries/usePositionQuery";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AutoAssignmentPropertyTypeEnum } from "@/lib/constants";
import usePatchPositionTaskMutation from "@/mutations/usePatchPositionTaskMutation";
import { useToast } from "@/components/ui/use-toast";
import LoadingButton from "@/components/LoadingButton";
import { useProfileContext } from "@/app/(root)/ProfileProvider";
import NewTabTableRow from "@/components/table/NewTabTableRow";

const columnHelper = createColumnHelper<PositionResponseDto["tasks"][number]>();

interface Props {
  position: PositionResponseDto;
}

export default function TasksTable({ position }: Props) {
  const { toast } = useToast();
  const router = useRouter();
  const [alertDialogState, setAlertDialogState] = useState<
    { open: false } | { open: true; taskId: string }
  >({ open: false });

  const queryClient = useQueryClient();
  const {
    mutateAsync: deletePositionTaskMutateAsync,
    isPending: isDeletePositionTaskMutationPending,
  } = useDeletePositionTaskMutation();
  const { mutateAsync: patchPositionTaskMutateAsync } =
    usePatchPositionTaskMutation();
  const {
    authority: { canEditPosition },
  } = useProfileContext();

  const columns = useMemo(
    () => [
      columnHelper.accessor("taskName", {
        header: "Name",
      }),
      columnHelper.accessor("autoAssignmentType", {
        header: "Auto Assignment Property Type",
        cell: ({ getValue, row }) => {
          return (
            <Select
              value={getValue()}
              onValueChange={(newValue) => {
                patchPositionTaskMutateAsync({
                  positionId: position.id,
                  taskId: row.original.taskId,
                  autoAssignmentType:
                    newValue as AutoAssignmentPropertyTypeEnum,
                })
                  .then(() => {
                    toast({
                      title: "Success",
                    });
                    queryClient.invalidateQueries({
                      queryKey: getPositionQueryKey(position.id),
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
              disabled={!canEditPosition}
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
                    setAlertDialogState({
                      open: true,
                      taskId: row.original.taskId,
                    });
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
    [
      canEditPosition,
      patchPositionTaskMutateAsync,
      position.id,
      queryClient,
      toast,
    ]
  );

  const table = useReactTable({
    data: position.tasks,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: ({ taskId }) => taskId,
    state: {
      columnVisibility: {
        action: canEditPosition,
      },
    },
  });

  return (
    <>
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
                <NewTabTableRow
                  key={row.id}
                  href={`/system-management/tasks/${row.id}`}
                  data-state={row.getIsSelected() && "selected"}
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
                </NewTabTableRow>
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
              isLoading={isDeletePositionTaskMutationPending}
              onClick={() => {
                if (!alertDialogState.open) {
                  return;
                }

                deletePositionTaskMutateAsync({
                  positionId: position.id,
                  taskId: alertDialogState.taskId,
                })
                  .then(() => {
                    toast({ title: "Success" });
                    queryClient.invalidateQueries({
                      queryKey: getPositionQueryKey(position.id),
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
