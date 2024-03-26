"use client";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { AxiosError } from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PositionResponseDto } from "@/api/api-spec";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import useDeletePositionUserMutation from "@/mutations/useDeletePositionUserMutation";
import { getPositionQueryKey } from "@/queries/usePositionQuery";
import LoadingButton from "@/components/LoadingButton";
import { useToast } from "@/components/ui/use-toast";
import { useProfileContext } from "@/app/(root)/ProfileProvider";
import NewTabTableRow from "@/components/table/NewTabTableRow";
import { InTableButton } from "@/components/ui/intablebutton";

const columnHelper =
  createColumnHelper<PositionResponseDto["workers"][number]>();

interface Props {
  position: PositionResponseDto;
}

export default function WorkersTable({ position }: Props) {
  const router = useRouter();
  const { mutateAsync, isPending } = useDeletePositionUserMutation(position.id);
  const queryClient = useQueryClient();
  const [alertDialogState, setAlertDialogState] = useState<
    { open: false } | { open: true; userId: string }
  >({ open: false });
  const { toast } = useToast();
  const {
    authority: { canEditPosition },
  } = useProfileContext();

  const columns = useMemo(
    () => [
      columnHelper.accessor("userName", {
        header: "Name",
      }),
      columnHelper.accessor("email", {
        header: "Email",
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
                <InTableButton
                  variant={"ghost"}
                  size={"icon"}
                  className="h-8 w-8"
                  onClick={() => {
                    setAlertDialogState({ open: true, userId: row.id });
                  }}
                >
                  <X className="w-3 h-3" />
                </InTableButton>
              </div>
            </div>
          );
        },
      }),
    ],
    []
  );

  const table = useReactTable({
    data: position.workers,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: ({ userId }) => userId,
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
                  href={`/system-management/users/${row.id}`}
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
              isLoading={isPending}
              onClick={() => {
                if (!alertDialogState.open) {
                  return;
                }

                mutateAsync({
                  userId: alertDialogState.userId,
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
