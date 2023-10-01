import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useQueryClient } from "@tanstack/react-query";
import { CellContext, createColumnHelper } from "@tanstack/react-table";
import { useMemo } from "react";
import { Check } from "lucide-react";
import DataTable from "@/components/table/DataTable";
import { AssignedTaskResponseFields } from "@/api";
import AssigneeCombobox from "@/components/combobox/AssigneeCombobox";
import usePatchAssignedTaskMutation from "@/queries/usePatchAssignedTaskMutation";
import { statuses } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import usePatchAssignedTaskCompleteMutation from "@/queries/usePatchAssignedTaskCompleteMutation";

// interface Props {
//   assignedTasks: AssignedTaskResponseFields[];
// }

// export default function AssignedTaskTable({ assignedTasks }: Props) {
//   console.log("rendered 4");
//   const taskTableRowData = useMemo(
//     () =>
//     assignedTasks.map<TaskTableRowData>((value) => {
//         const {
//           id,
//           assignee: { name, userId },
//           description,
//           taskName,
//           taskStatus,
//         } = value;

//         return {
//           jobId,
//           projectId,
//           id,
//           assignee: {
//             name,
//             userId,
//           },
//           description,
//           name: taskName,
//           status: taskStatus,
//         };
//       }),
//     [jobId, projectId, tasks]
//   );
//   const table = useReactTable({
//     data: taskTableRowData ?? [],
//     columns: taskTableColumns,
//     getCoreRowModel: getCoreRowModel(),
//     getRowId: (originalRow) => originalRow.id,
//   });

//   return <DataTable table={table} />;
// }
interface AssignedTaskTableRowData {
  id: string;
  description: string | null;
  name: string;
  status: string;
  assigneeId: string | null;
}

const columnHelper = createColumnHelper<AssignedTaskTableRowData>();

interface Props {
  projectId: string;
  jobId: string;
  assignedTasks: AssignedTaskResponseFields[];
}

export default function AssignedTaskTable({
  assignedTasks,
  jobId,
  projectId,
}: Props) {
  const data = useMemo(
    () =>
      assignedTasks.map<AssignedTaskTableRowData>((value) => {
        const { assignTaskId, assigneeId, status, taskName, description } =
          value;

        return {
          assigneeId,
          description,
          id: assignTaskId,
          name: taskName,
          status,
        };
      }),
    [assignedTasks]
  );

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Name",
        size: 350,
        cell: ({ getValue }) => (
          <p className="w-[318px] whitespace-nowrap overflow-hidden text-ellipsis">
            {getValue()}
          </p>
        ),
      }),
      columnHelper.accessor("description", {
        header: "Description",
        size: 300,
        cell: ({ getValue }) => {
          const value = getValue();

          if (value == null || value === "") {
            return <p className="text-muted-foreground">-</p>;
          }

          return (
            <p className="w-[268px] whitespace-nowrap overflow-hidden text-ellipsis">
              {value}
            </p>
          );
        },
      }),
      columnHelper.accessor("status", {
        header: "Status",
        size: 150,
        cell: ({ getValue }) => {
          const value = getValue();
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
        header: "Assignee",
        size: 300,
        cell: (cellContext) => {
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

  const table = useReactTable({
    data: data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (originalRow) => originalRow.id,
  });

  return <DataTable table={table} />;
}

interface AssigneeProps {
  cellContext: CellContext<AssignedTaskTableRowData, string | null>;
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

  return (
    <div className={cn("flex gap-2 max-w-[268px]")}>
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
        disabled={isCompleted}
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
