import { createColumnHelper } from "@tanstack/react-table";
import { ServicePaginatedResponseDto } from "@/api";

const columnHelper =
  createColumnHelper<ServicePaginatedResponseDto["items"][number]>();

export const serviceColumns = [
  columnHelper.accessor("name", {
    header: "Name",
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
  columnHelper.accessor("billingCode", {
    header: "Billing Code",
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
  // columnHelper.accessor("basePrice", {
  //   header: "Price",
  //   size: 200,
  //   cell: ({ getValue, column }) => (
  //     <p
  //       style={{ width: column.getSize() - 32 }}
  //       className={`whitespace-nowrap overflow-hidden text-ellipsis`}
  //     >
  //       ${getValue()}
  //     </p>
  //   ),
  // }),
];
