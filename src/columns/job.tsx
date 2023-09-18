import { createColumnHelper } from "@tanstack/react-table";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { statuses } from "@/lib/constants";
import { Checkbox } from "@/components/ui/checkbox";

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
  orderedTasks: {
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
    size: 100,
    cell: ({ getValue }) => (
      <div className="flex">
        <Checkbox checked={getValue()} />
      </div>
    ),
  }),
  columnHelper.accessor("jobRequestNumber", {
    header: "#",
    size: 100,
  }),
  columnHelper.accessor("propertyFullAddress", {
    header: "Address",
    size: 400,
    cell: ({ getValue }) => (
      <p className="w-[368px] whitespace-nowrap overflow-hidden text-ellipsis">
        {getValue()}
      </p>
    ),
  }),
  columnHelper.accessor("organizationName", {
    header: "Organization",
    size: 200,
    cell: ({ getValue }) => (
      <p className="w-[168px] whitespace-nowrap overflow-hidden text-ellipsis">
        {getValue()}
      </p>
    ),
  }),
  columnHelper.accessor("clientUserName", {
    header: "Client User",
    size: 200,
    cell: ({ getValue }) => (
      <p className="w-[168px] whitespace-nowrap overflow-hidden text-ellipsis">
        {getValue()}
      </p>
    ),
  }),
  columnHelper.accessor("mountingType", {
    header: "Mounting Type",
    size: 250,
  }),
  columnHelper.accessor("additionalInformation", {
    header: "Additional Information",
    size: 400,
    cell: ({ getValue }) => {
      const value = getValue();

      if (value == null || value === "") {
        return <p className="text-muted-foreground">-</p>;
      }

      return (
        <p className="w-[368px] whitespace-nowrap overflow-hidden text-ellipsis">
          {value}
        </p>
      );
    },
  }),
  columnHelper.accessor("jobStatus", {
    header: "Job Status",
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
  columnHelper.accessor("orderedTasks", {
    header: "Tasks",
    size: 100,
    cell: ({ getValue }) => {
      const orderedTasks = getValue();

      return (
        <HoverCard openDelay={0} closeDelay={100}>
          <HoverCardTrigger>
            <p className="cursor-pointer hover:underline">
              {orderedTasks.length}
            </p>
          </HoverCardTrigger>
          <HoverCardContent
            className="p-0 w-[auto] cursor-default"
            sideOffset={4}
          >
            <div>
              {orderedTasks.map((orderedTask) => {
                const status = statuses.find(
                  (status) => status.value === orderedTask.status
                );

                return (
                  <TooltipProvider key={orderedTask.id} delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center pl-2 pr-3 py-1.5 border-t first:border-0">
                          {status && (
                            <status.Icon
                              className={`w-4 h-4 mr-2 flex-shrink-0 ${status.color}`}
                            />
                          )}
                          <div className="flex flex-col">
                            <p className="font-medium">{orderedTask.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {orderedTask.assigneeName ?? "-"}
                            </p>
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="left" sideOffset={8}>
                        <p className="text-xs">{orderedTask.status}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
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
    size: 300,
    cell: ({ getValue }) =>
      new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(getValue())),
  }),
];
