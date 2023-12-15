import { createColumnHelper } from "@tanstack/react-table";
import { JobPaginatedResponseDto, JobResponseDto } from "@/api";
import TasksBadge from "@/components/badge/TasksBadge";
import { Checkbox } from "@/components/ui/checkbox";
import { statuses } from "@/lib/constants";
import { formatInEST } from "@/lib/utils";

const columnHelper = createColumnHelper<
  JobResponseDto | JobPaginatedResponseDto["items"][number]
>();

export const jobColumns = [
  columnHelper.accessor("isExpedited", {
    header: "Expedite",
    cell: ({ getValue }) => <Checkbox checked={getValue()} />,
  }),
  columnHelper.accessor("clientInfo.clientOrganizationName", {
    header: "Organization",
  }),
  columnHelper.accessor("jobName", {
    header: "Name",
  }),
  columnHelper.accessor("clientInfo.clientUserName", {
    header: "Client User",
  }),
  columnHelper.accessor("mountingType", {
    header: "Mounting Type",
  }),
  columnHelper.accessor("additionalInformationFromClient", {
    header: "Additional Information",
    cell: ({ getValue }) => {
      const value = getValue();
      if (value == null) {
        return <p className="text-muted-foreground">-</p>;
      }

      return value;
    },
  }),
  columnHelper.accessor("jobStatus", {
    header: "Status",
    cell: ({ getValue }) => {
      const value = getValue();
      const status = statuses.find((status) => status.value === value);

      if (status == null) {
        return null;
      }

      return (
        <div className={`flex items-center`}>
          <status.Icon className={`w-4 h-4 mr-2 ${status.color}`} />
          <span className="whitespace-nowrap">{status.value}</span>
        </div>
      );
    },
  }),
  columnHelper.accessor("assignedTasks", {
    header: "Tasks",
    cell: ({ getValue }) => <TasksBadge tasks={getValue()} />,
  }),
  columnHelper.accessor("receivedAt", {
    header: "Date Received (EST)",
    cell: ({ getValue }) => formatInEST(getValue()),
  }),
];
