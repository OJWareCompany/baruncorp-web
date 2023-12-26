import { X } from "lucide-react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { PositionResponseDto } from "@/api";
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
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
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

const columnHelper = createColumnHelper<PositionResponseDto["tasks"][number]>();

interface Props {
  position: PositionResponseDto;
}

export default function TasksTable({ position }: Props) {
  const { toast } = useToast();
  const router = useRouter();

  const queryClient = useQueryClient();
  const { mutateAsync: deletePositionTaskMutateAsync } =
    useDeletePositionTaskMutation();
  const { mutateAsync: patchPositionTaskMutateAsync } =
    usePatchPositionTaskMutation(position.id);

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
                  taskId: row.original.taskId,
                  autoAssignmentType:
                    newValue as AutoAssignmentPropertyTypeEnum,
                }).then(() => {
                  toast({
                    title: "Success",
                  });
                  queryClient.invalidateQueries({
                    queryKey: getPositionQueryKey(position.id),
                  });
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
                          deletePositionTaskMutateAsync({
                            positionId: position.id,
                            taskId: row.original.taskId,
                          }).then(() => {
                            queryClient.invalidateQueries({
                              queryKey: getPositionQueryKey(position.id),
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
    [deletePositionTaskMutateAsync, position.id, queryClient]
  );

  const table = useReactTable({
    data: position.tasks,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: ({ taskId }) => taskId,
  });

  return (
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
              <TableCell colSpan={columns.length} className="h-24 text-center">
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
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
