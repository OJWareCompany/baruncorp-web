import { createColumnHelper } from "@tanstack/react-table";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

import { statuses } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { JobPaginatedResponseDto, LineItem, ProjectResponseDto } from "@/api";
import { formatDateTime } from "@/lib/utils";

const jobPaginatedColumnHelper =
  createColumnHelper<JobPaginatedResponseDto["items"][number]>();

export const jobPaginatedColumns = [
  jobPaginatedColumnHelper.accessor("isExpedited", {
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
  jobPaginatedColumnHelper.accessor("jobRequestNumber", {
    header: "#",
    size: 100,
    cell: ({ getValue, column }) => (
      <p
        style={{ width: column.getSize() - 32 }}
        className={`whitespace-nowrap overflow-hidden text-ellipsis`}
      >
        {getValue()}
      </p>
    ),
  }),
  jobPaginatedColumnHelper.accessor("propertyFullAddress", {
    header: "Address",
    size: 400,
    cell: ({ getValue, column }) => (
      <p
        style={{ width: column.getSize() - 32 }}
        className={`whitespace-nowrap overflow-hidden text-ellipsis`}
      >
        {getValue()}
      </p>
    ),
  }),
  jobPaginatedColumnHelper.accessor("clientInfo.clientOrganizationName", {
    header: "Organization",
    size: 200,
    cell: ({ getValue, column }) => (
      <p
        style={{ width: column.getSize() - 32 }}
        className={`whitespace-nowrap overflow-hidden text-ellipsis`}
      >
        {getValue()}
      </p>
    ),
  }),
  jobPaginatedColumnHelper.accessor("clientInfo.clientUserName", {
    header: "Client User",
    size: 200,
    cell: ({ getValue, column }) => (
      <p
        style={{ width: column.getSize() - 32 }}
        className={`whitespace-nowrap overflow-hidden text-ellipsis`}
      >
        {getValue()}
      </p>
    ),
  }),
  jobPaginatedColumnHelper.accessor("mountingType", {
    header: "Mounting Type",
    size: 250,
    cell: ({ getValue, column }) => (
      <p
        style={{ width: column.getSize() - 32 }}
        className={`whitespace-nowrap overflow-hidden text-ellipsis`}
      >
        {getValue()}
      </p>
    ),
  }),
  jobPaginatedColumnHelper.accessor("additionalInformationFromClient", {
    header: "Additional Information",
    size: 400,
    cell: ({ getValue, column }) => {
      const value = getValue();

      if (value == null) {
        return <p className="text-muted-foreground">-</p>;
      }

      return (
        <p
          style={{ width: column.getSize() - 32 }}
          className={`whitespace-nowrap overflow-hidden text-ellipsis`}
        >
          {value}
        </p>
      );
    },
  }),
  jobPaginatedColumnHelper.accessor("jobStatus", {
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
  jobPaginatedColumnHelper.accessor("assignedTasks", {
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
                    key={task.assignTaskId}
                  >
                    {status && (
                      <status.Icon
                        className={`w-4 h-4 mr-2 flex-shrink-0 ${status.color}`}
                      />
                    )}
                    <div className="flex flex-col">
                      <p className="font-medium">{task.taskName}</p>
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
  jobPaginatedColumnHelper.accessor("receivedAt", {
    header: "Date Received",
    size: 200,
    cell: ({ getValue, column }) => (
      <p
        style={{ width: column.getSize() - 32 }}
        className={`whitespace-nowrap overflow-hidden text-ellipsis`}
      >
        {formatDateTime(getValue())}
      </p>
    ),
  }),
];

const jobForProjectColumnHelper =
  createColumnHelper<ProjectResponseDto["jobs"][number]>();

export const jobForProjectColumns = [
  jobForProjectColumnHelper.accessor("isExpedited", {
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
  jobForProjectColumnHelper.accessor("jobRequestNumber", {
    header: "#",
    size: 100,
    cell: ({ getValue, column }) => (
      <p
        style={{ width: column.getSize() - 32 }}
        className={`whitespace-nowrap overflow-hidden text-ellipsis`}
      >
        {getValue()}
      </p>
    ),
  }),
  jobForProjectColumnHelper.accessor("propertyFullAddress", {
    header: "Address",
    size: 400,
    cell: ({ getValue, column }) => (
      <p
        style={{ width: column.getSize() - 32 }}
        className={`whitespace-nowrap overflow-hidden text-ellipsis`}
      >
        {getValue()}
      </p>
    ),
  }),
  jobForProjectColumnHelper.accessor("clientInfo.clientOrganizationName", {
    header: "Organization",
    size: 200,
    cell: ({ getValue, column }) => (
      <p
        style={{ width: column.getSize() - 32 }}
        className={`whitespace-nowrap overflow-hidden text-ellipsis`}
      >
        {getValue()}
      </p>
    ),
  }),
  jobForProjectColumnHelper.accessor("clientInfo.clientUserName", {
    header: "Client User",
    size: 200,
    cell: ({ getValue, column }) => (
      <p
        style={{ width: column.getSize() - 32 }}
        className={`whitespace-nowrap overflow-hidden text-ellipsis`}
      >
        {getValue()}
      </p>
    ),
  }),
  jobForProjectColumnHelper.accessor("mountingType", {
    header: "Mounting Type",
    size: 250,
    cell: ({ getValue, column }) => (
      <p
        style={{ width: column.getSize() - 32 }}
        className={`whitespace-nowrap overflow-hidden text-ellipsis`}
      >
        {getValue()}
      </p>
    ),
  }),
  jobForProjectColumnHelper.accessor("additionalInformationFromClient", {
    header: "Additional Information",
    size: 400,
    cell: ({ getValue, column }) => {
      const value = getValue();

      if (value == null) {
        return <p className="text-muted-foreground">-</p>;
      }

      return (
        <p
          style={{ width: column.getSize() - 32 }}
          className={`whitespace-nowrap overflow-hidden text-ellipsis`}
        >
          {value}
        </p>
      );
    },
  }),
  jobForProjectColumnHelper.accessor("jobStatus", {
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
  jobForProjectColumnHelper.accessor("assignedTasks", {
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
                    key={task.assignTaskId}
                  >
                    {status && (
                      <status.Icon
                        className={`w-4 h-4 mr-2 flex-shrink-0 ${status.color}`}
                      />
                    )}
                    <div className="flex flex-col">
                      <p className="font-medium">{task.taskName}</p>
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
  jobForProjectColumnHelper.accessor("receivedAt", {
    header: "Date Received",
    size: 200,
    cell: ({ getValue, column }) => (
      <p
        style={{ width: column.getSize() - 32 }}
        className={`whitespace-nowrap overflow-hidden text-ellipsis`}
      >
        {formatDateTime(getValue())}
      </p>
    ),
  }),
];

interface JobTableExportData {
  [index: string]: unknown;
  Expedite: boolean;
  "#": number;
  Address: string;
  Organization: string;
  "Client User": string;
  "Mounting Type": string;
  "Additional Information": string;
  Status: string;
  Tasks: string;
  "Date Received": string;
}

export function getJobTableExportDataFromJobs(
  jobs: JobPaginatedResponseDto | undefined
): JobTableExportData[] | undefined {
  return jobs?.items.map<JobTableExportData>((value) => ({
    Expedite: value.isExpedited,
    "#": value.jobRequestNumber,
    Address: value.propertyFullAddress,
    Organization: value.clientInfo.clientOrganizationName,
    "Client User": value.clientInfo.clientUserName,
    "Mounting Type": value.mountingType,
    "Additional Information": value.additionalInformationFromClient ?? "-",
    Status: value.jobStatus,
    Tasks: value.assignedTasks
      .map(
        (value) =>
          `${value.taskName} - ${value.status}${
            value.assigneeName ? ` - ${value.assigneeName}` : ""
          }`
      )
      .join(" / "),
    "Date Received": formatDateTime(value.receivedAt),
  }));
}

const lineItemColumnHelper = createColumnHelper<LineItem>();

export const lineItemColumns = [
  lineItemColumnHelper.accessor("clientOrganization.name", {
    header: "Organization",
    size: 200,
    cell: ({ getValue, column }) => (
      <p
        style={{ width: column.getSize() - 32 }}
        className={`whitespace-nowrap overflow-hidden text-ellipsis`}
      >
        {getValue()}
      </p>
    ),
  }),
  lineItemColumnHelper.accessor("description", {
    header: "Description",
    size: 400,
    cell: ({ getValue, column }) => (
      <p
        style={{ width: column.getSize() - 32 }}
        className={`whitespace-nowrap overflow-hidden text-ellipsis`}
      >
        {getValue()}
      </p>
    ),
  }),
  lineItemColumnHelper.accessor("dateSentToClient", {
    header: "Date Sent to Client",
    size: 200,
    cell: ({ getValue, column }) => (
      <p
        style={{ width: column.getSize() - 32 }}
        className={`whitespace-nowrap overflow-hidden text-ellipsis`}
      >
        {formatDateTime(getValue())}
      </p>
    ),
  }),
  lineItemColumnHelper.accessor("mountingType", {
    header: "Mounting Type",
    size: 250,
    cell: ({ getValue, column }) => (
      <p
        style={{ width: column.getSize() - 32 }}
        className={`whitespace-nowrap overflow-hidden text-ellipsis`}
      >
        {getValue()}
      </p>
    ),
  }),
  lineItemColumnHelper.accessor("propertyType", {
    header: "Property Type",
    size: 150,
    cell: ({ getValue, column }) => (
      <p
        style={{ width: column.getSize() - 32 }}
        className={`whitespace-nowrap overflow-hidden text-ellipsis`}
      >
        {getValue()}
      </p>
    ),
  }),
  lineItemColumnHelper.accessor("billingCodes", {
    header: "Billing Codes",
    size: 150,
    cell: ({ getValue, column }) => {
      return (
        <div className="flex flex-wrap gap-1">
          {getValue().map((value) => (
            <Badge key={value} variant={"outline"}>
              {value}
            </Badge>
          ))}
        </div>
      );
    },
  }),
  lineItemColumnHelper.accessor("price", {
    header: "Price",
    size: 150,
    cell: ({ getValue, column }) => (
      <p
        style={{ width: column.getSize() - 32 }}
        className={`whitespace-nowrap overflow-hidden text-ellipsis`}
      >
        ${getValue()}
      </p>
    ),
  }),
  lineItemColumnHelper.accessor("pricingType", {
    header: "Pricing Type",
    size: 150,
    cell: ({ getValue, column }) => (
      <p
        style={{ width: column.getSize() - 32 }}
        className={`whitespace-nowrap overflow-hidden text-ellipsis`}
      >
        {getValue()}
      </p>
    ),
  }),
  lineItemColumnHelper.accessor("state", {
    header: "State",
    size: 150,
    cell: ({ getValue, column }) => (
      <p
        style={{ width: column.getSize() - 32 }}
        className={`whitespace-nowrap overflow-hidden text-ellipsis`}
      >
        {getValue()}
      </p>
    ),
  }),
  lineItemColumnHelper.accessor("containsRevisionTask", {
    header: "Contains Revision Task",
    size: 200,
    cell: ({ getValue, column }) => (
      <p
        style={{ width: column.getSize() - 32 }}
        className={`whitespace-nowrap overflow-hidden text-ellipsis`}
      >
        {getValue()}
      </p>
    ),
  }),
  lineItemColumnHelper.accessor("taskSizeForRevision", {
    header: "Task Size For Revision",
    size: 200,
    cell: ({ getValue, column }) => (
      <p
        style={{ width: column.getSize() - 32 }}
        className={`whitespace-nowrap overflow-hidden text-ellipsis`}
      >
        {getValue()}
      </p>
    ),
  }),
];

interface LineItemTableExportData {
  [index: string]: unknown;
  Organization: string;
  Description: string;
  "Date Sent to Client": string;
  "Mounting Type": string;
  "Property Type": string;
  "Billing Codes": string;
  Price: string;
  "Pricing Type": string;
  State: string;
  // "Contains Revision Task":string;
  // "Task Size For Revision":string;
}

export function getLineItemTableExportDataFromLineItem(
  lineItem: LineItem[] | undefined
): LineItemTableExportData[] | undefined {
  return lineItem?.map<LineItemTableExportData>((value) => ({
    Organization: value.clientOrganization.name,
    Description: value.description,
    "Date Sent to Client": formatDateTime(value.dateSentToClient),
    "Mounting Type": value.mountingType,
    "Property Type": value.propertyType,
    "Billing Codes": value.billingCodes.map((value) => `(${value})`).join(" "),
    Price: `$${value.price}`,
    "Pricing Type": value.pricingType,
    State: value.state,
    // "Contains Revision Task":value.containsRevisionTask, TODO: check
    // "Task Size For Revision":value.taskSizeForRevision,
  }));
}
