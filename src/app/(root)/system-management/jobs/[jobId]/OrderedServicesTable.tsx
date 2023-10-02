import { useQueryClient } from "@tanstack/react-query";
import { CellContext, createColumnHelper } from "@tanstack/react-table";
import { useMemo } from "react";
import {
  Check,
  ChevronDown,
  ChevronsDown,
  CornerDownRight,
} from "lucide-react";
import {
  AssignedTaskResponseFields,
  OrderedServiceResponseFields,
} from "@/api";
import AssigneeCombobox from "@/components/combobox/AssigneeCombobox";
import usePatchAssignedTaskMutation from "@/queries/usePatchAssignedTaskMutation";
import { orderedServiceStatuses, statuses } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import usePatchAssignedTaskCompleteMutation from "@/queries/usePatchAssignedTaskCompleteMutation";

import usePatchOrderedServiceCancelMutation from "@/queries/usePatchOrderedServiceCancelMutation";
import usePatchOrderedServiceReactivateMutation from "@/queries/usePatchOrderedServiceReactivateMutation";
import { AlertDialog, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import CommonAlertDialogContent from "@/components/CommonAlertDialogContent";
import ExpandableTable from "@/components/table/ExpandableTable";

interface RowData {
  id: string;
  name: string;
  description: string | null;
  status: string;
  price: number | null;
  assigneeId: string | null;
  serviceId: string | null;
  subRows?: RowData[];
}

const columnHelper = createColumnHelper<RowData>();

interface Props {
  projectId: string;
  jobId: string;
  assignedTasks: AssignedTaskResponseFields[];
  orderedServices: OrderedServiceResponseFields[];
}

export default function OrderedServicesTable({
  orderedServices,
  assignedTasks,
  jobId,
  projectId,
}: Props) {
  const data = useMemo(
    () =>
      orderedServices.map<RowData>((value) => {
        const {
          status,
          description,
          serviceName,
          price,
          orderedServiceId,
          serviceId,
        } = value;

        return {
          description,
          id: orderedServiceId,
          name: serviceName,
          price,
          status,
          assigneeId: null,
          serviceId,
          subRows: assignedTasks
            .filter((value) => value.orderedServiceId === orderedServiceId)
            .map((value) => {
              const {
                assigneeId,
                description,
                assignTaskId,
                taskName,
                status,
              } = value;

              return {
                assigneeId,
                description,
                id: assignTaskId,
                name: taskName,
                price: null,
                status,
                serviceId: null,
              };
            }),
        };
      }),
    [assignedTasks, orderedServices]
  );

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "expand",
        header: ({ table }) => {
          return (
            <Button
              variant={"ghost"}
              size={"icon"}
              className="w-9 h-9 [&[data-expand=open]>svg]:rotate-180"
              onClick={table.getToggleAllRowsExpandedHandler()}
              data-expand={table.getIsAllRowsExpanded() ? "open" : "closed"}
            >
              <ChevronsDown className="w-4 h-4 transition-transform duration-200" />
            </Button>
          );
        },
        size: 68,
        cell: ({ row }) => {
          if (row.depth > 0) {
            return;
          }

          return (
            <Button
              variant={"ghost"}
              size={"icon"}
              className="w-9 h-9 [&[data-expand=open]>svg]:rotate-180"
              onClick={row.getToggleExpandedHandler()}
              data-expand={row.getIsExpanded() ? "open" : "closed"}
            >
              <ChevronDown className="w-4 h-4 transition-transform duration-200" />
            </Button>
          );
        },
      }),
      columnHelper.accessor("name", {
        header: "Name",
        size: 400,
        cell: ({ getValue, row, column }) => {
          const value = getValue();

          if (row.depth === 0) {
            return (
              <p
                className={`w-[${
                  column.getSize() - 32
                }px] whitespace-nowrap overflow-hidden text-ellipsis`}
              >
                {value}
              </p>
            );
          }

          return (
            <div className="flex gap-4 items-center">
              <CornerDownRight className="h-4 w-4 text-muted-foreground" />
              <p>{row.original.description ?? value}</p>
            </div>
          );
        },
      }),
      columnHelper.accessor("price", {
        header: "Price",
        size: 150,
        cell: ({ getValue, row, column }) => {
          const value = getValue();

          if (row.depth > 0) {
            return <p className="text-muted-foreground">-</p>;
          }

          return (
            <p
              className={`w-[${
                column.getSize() - 32
              }px] whitespace-nowrap overflow-hidden text-ellipsis`}
            >
              ${value}
            </p>
          );
        },
      }),
      columnHelper.accessor("status", {
        header: "Status",
        size: 200,
        cell: ({ getValue, row }) => {
          const value = getValue();
          if (row.depth === 0) {
            const status = orderedServiceStatuses.find(
              (status) => status.value === value
            );
            if (status == null) {
              return null;
            }

            return (
              <div className="flex items-center">
                <status.Icon className={`w-4 h-4 mr-2 ${status.color}`} />
                <span>{status.value}</span>
              </div>
            );
          }

          const status = statuses.find((status) => status.value === value);
          if (status == null) {
            return null;
          }

          return (
            <div className="flex items-center">
              <status.Icon className={`w-4 h-4 mr-2 ${status.color}`} />
              <span>{status.value}</span>
            </div>
          );
        },
      }),
      columnHelper.accessor("assigneeId", {
        header: "Action",
        size: 300,
        cell: (cellContext) => {
          if (cellContext.row.depth === 0) {
            return (
              <Action
                cellContext={cellContext}
                projectId={projectId}
                jobId={jobId}
              />
            );
          }

          return (
            <Assignee
              cellContext={cellContext}
              projectId={projectId}
              jobId={jobId}
            />
          );
        },
      }),
    ],
    [jobId, projectId]
  );

  return <ExpandableTable columns={columns} data={data ?? []} />;
}

interface AssigneeProps {
  cellContext: CellContext<RowData, string | null>;
  jobId: string;
  projectId: string;
}

function Assignee({
  cellContext: { getValue, row },
  jobId,
  projectId,
}: AssigneeProps) {
  const assigneeId = getValue();

  /**
   * Query
   */
  const { mutateAsync: patchAssignedTaskMutateAsync } =
    usePatchAssignedTaskMutation(row.original.id);
  const { mutateAsync: patchAssignedTaskCompleteMutateAsync } =
    usePatchAssignedTaskCompleteMutation(row.original.id);
  const queryClient = useQueryClient();

  const isInProgress = row.original.status === "In Progress";
  const isCompleted = row.original.status === "Completed";
  const isCanceled = row.original.status === "Canceled";
  const isOnHold = row.original.status === "On Hold";

  return (
    <div className={cn("flex gap-2")}>
      <AssigneeCombobox
        userId={assigneeId ?? ""}
        onSelect={(newUserId) => {
          patchAssignedTaskMutateAsync({
            assigneeId: newUserId,
          })
            .then(() => {
              queryClient.invalidateQueries({
                queryKey: ["jobs", "detail", jobId],
              });
              queryClient.invalidateQueries({
                queryKey: ["projects", "detail", projectId],
              });
            })
            .catch(() => {});
        }}
        buttonClassName="w-full"
        buttonSize={"sm"}
        disabled={isCompleted || isOnHold || isCanceled}
      />
      {isInProgress && (
        <Button
          size={"icon"}
          variant={"outline"}
          className="w-9 h-9 flex-shrink-0"
          onClick={() => {
            patchAssignedTaskCompleteMutateAsync()
              .then(() => {
                queryClient.invalidateQueries({
                  queryKey: ["jobs", "detail", jobId],
                });
                queryClient.invalidateQueries({
                  queryKey: ["projects", "detail", projectId],
                });
              })
              .catch(() => {});
          }}
        >
          <Check className="w-4 h-4 text-green-700" />
        </Button>
      )}
    </div>
  );
}

interface ActionProps {
  cellContext: CellContext<RowData, string | null>;
  jobId: string;
  projectId: string;
}

function Action({ cellContext: { row }, jobId, projectId }: ActionProps) {
  const isCanceled = row.original.status === "Canceled";
  const isCompleted = row.original.status === "Completed";

  /**
   * Query
   */
  const { mutateAsync: patchOrderedServiceCancelMutateAsync } =
    usePatchOrderedServiceCancelMutation(row.original.id);
  const { mutateAsync: patchOrderedServiceReactivateMutateAsync } =
    usePatchOrderedServiceReactivateMutation(row.original.id);
  const queryClient = useQueryClient();

  if (!isCanceled) {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            size={"sm"}
            variant={"outline"}
            className="w-full"
            disabled={isCompleted}
          >
            Cancel
          </Button>
        </AlertDialogTrigger>
        <CommonAlertDialogContent
          onContinue={() => {
            patchOrderedServiceCancelMutateAsync()
              .then(() => {
                queryClient.invalidateQueries({
                  queryKey: ["jobs", "detail", jobId],
                });
                queryClient.invalidateQueries({
                  queryKey: ["projects", "detail", projectId],
                });
              })
              .catch(() => {});
          }}
        />
      </AlertDialog>
    );
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size={"sm"} variant={"outline"} className="w-full">
          Reactivate
        </Button>
      </AlertDialogTrigger>
      <CommonAlertDialogContent
        onContinue={() => {
          patchOrderedServiceReactivateMutateAsync()
            .then(() => {
              queryClient.invalidateQueries({
                queryKey: ["jobs", "detail", jobId],
              });
              queryClient.invalidateQueries({
                queryKey: ["projects", "detail", projectId],
              });
            })
            .catch(() => {});
        }}
      />
    </AlertDialog>
  );
}
