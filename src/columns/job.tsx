import { createColumnHelper } from "@tanstack/react-table";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

import { statuses } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";

export interface JobTableRowData {
  id: string;
  isExpedited: boolean;
  jobRequestNumber: number;
  propertyFullAddress: string;
  organizationName: string;
  clientUserName: string;
  mountingType: string;
  additionalInformation: string | null;
  jobStatus: string;
  tasks: {
    id: string;
    status: string;
    name: string;
    assigneeName: string | null;
  }[];
  receivedAt: string;
}

const columnHelper = createColumnHelper<JobTableRowData>();

export const jobTableColumns = [
  columnHelper.accessor("isExpedited", {
    header: "Expedite",
    size: 150,
    cell: ({ getValue }) => {
      const value = getValue();

      if (value === false) {
        return "-";
      }

      return <Badge variant={"destructive"}>Expedite</Badge>;
    },
  }),
  columnHelper.accessor("jobRequestNumber", {
    header: "#",
    size: 100,
    cell: ({ getValue, column }) => (
      <p
        className={`w-[${
          column.getSize() - 32
        }px] whitespace-nowrap overflow-hidden text-ellipsis`}
      >
        {getValue()}
      </p>
    ),
  }),
  columnHelper.accessor("propertyFullAddress", {
    header: "Address",
    size: 400,
    cell: ({ getValue, column }) => (
      <p
        className={`w-[${
          column.getSize() - 32
        }px] whitespace-nowrap overflow-hidden text-ellipsis`}
      >
        {getValue()}
      </p>
    ),
  }),
  columnHelper.accessor("organizationName", {
    header: "Organization",
    size: 200,
    cell: ({ getValue, column }) => (
      <p
        className={`w-[${
          column.getSize() - 32
        }px] whitespace-nowrap overflow-hidden text-ellipsis`}
      >
        {getValue()}
      </p>
    ),
  }),
  columnHelper.accessor("clientUserName", {
    header: "Client User",
    size: 200,
    cell: ({ getValue, column }) => (
      <p
        className={`w-[${
          column.getSize() - 32
        }px] whitespace-nowrap overflow-hidden text-ellipsis`}
      >
        {getValue()}
      </p>
    ),
  }),
  columnHelper.accessor("mountingType", {
    header: "Mounting Type",
    size: 250,
    cell: ({ getValue, column }) => (
      <p
        className={`w-[${
          column.getSize() - 32
        }px] whitespace-nowrap overflow-hidden text-ellipsis`}
      >
        {getValue()}
      </p>
    ),
  }),
  columnHelper.accessor("additionalInformation", {
    header: "Additional Information",
    size: 400,
    cell: ({ getValue, column }) => {
      const value = getValue();

      if (value == null) {
        return <p className="text-muted-foreground">-</p>;
      }

      return (
        <p
          className={`w-[${
            column.getSize() - 32
          }px] whitespace-nowrap overflow-hidden text-ellipsis`}
        >
          {value}
        </p>
      );
    },
  }),
  columnHelper.accessor("jobStatus", {
    header: "Status",
    size: 150,
    cell: ({ getValue }) => {
      const value = getValue();
      const status = statuses.find((status) => status.value === value);

      if (status == null) {
        return null;
      }

      return (
        <div className={`flex items-center`}>
          <status.Icon className={`w-4 h-4 mr-2 ${status.color}`} />
          <span>{status.value}</span>
        </div>
      );
    },
  }),
  columnHelper.accessor("tasks", {
    header: "Tasks",
    size: 100,
    cell: ({ getValue }) => {
      const tasks = getValue();

      return (
        <HoverCard openDelay={0} closeDelay={100}>
          <HoverCardTrigger>
            <Badge variant={"outline"}>{tasks.length}</Badge>
          </HoverCardTrigger>
          <HoverCardContent
            className="p-0 w-[auto] cursor-default"
            side="right"
          >
            <div>
              {tasks.map((task) => {
                const status = statuses.find(
                  (status) => status.value === task.status
                );

                return (
                  <div
                    className="flex items-center pl-2 pr-3 py-1.5 border-t first:border-0"
                    key={task.id}
                  >
                    {status && (
                      <status.Icon
                        className={`w-4 h-4 mr-2 flex-shrink-0 ${status.color}`}
                      />
                    )}
                    <div className="flex flex-col">
                      <p className="font-medium">{task.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {task.assigneeName ?? "-"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </HoverCardContent>
        </HoverCard>
      );
    },
  }),
  columnHelper.accessor("receivedAt", {
    header: "Date Received",
    size: 200,
    cell: ({ getValue, column }) => (
      <p
        className={`w-[${
          column.getSize() - 32
        }px] whitespace-nowrap overflow-hidden text-ellipsis`}
      >
        {new Intl.DateTimeFormat("en-US", {
          dateStyle: "short",
          timeStyle: "short",
        }).format(new Date(getValue()))}
      </p>
    ),
  }),
];
