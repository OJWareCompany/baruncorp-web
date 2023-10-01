import { createColumnHelper } from "@tanstack/react-table";

export interface ServiceTableRowData {
  id: string;
  name: string;
  billingCode: string;
  basePrice: number;
}

const columnHelper = createColumnHelper<ServiceTableRowData>();

export const serviceTableColumn = [
  columnHelper.accessor("name", {
    header: "Name",
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
  columnHelper.accessor("billingCode", {
    header: "Billing Code",
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
  columnHelper.accessor("basePrice", {
    header: "Price",
    size: 200,
    cell: ({ getValue, column }) => (
      <p
        className={`w-[${
          column.getSize() - 32
        }px] whitespace-nowrap overflow-hidden text-ellipsis`}
      >
        ${getValue()}
      </p>
    ),
  }),
];
