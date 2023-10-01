// import { CellContext, createColumnHelper } from "@tanstack/react-table";
// import { useQueryClient } from "@tanstack/react-query";
// import useAllUsersByOrganizationIdQuery from "@/queries/useAllUsersByOrganizationIdQuery";
// import usePatchOrderedTaskMutation from "@/queries/usePatchOrderedTaskMutation";
// import StatusesCombobox from "@/components/combobox/StatusesCombobox";
// import AssigneeCombobox from "@/components/combobox/AssigneeCombobox";

// // isNewTask, invoiceAmount 표현되어야 하는가?
// export interface TaskTableRowData {
//   id: string;
//   description: string | null;
//   name: string;
//   status: string;
//   assignee: {
//     userId: string | null;
//     name: string | null;
//   };
// }

// interface StatusProps {
//   cellContext: CellContext<TaskTableRowData, string>;
// }

// function Status({ cellContext: { getValue, row } }: StatusProps) {
//   const selectedStatusValue = getValue();
//   const { mutateAsync } = usePatchOrderedTaskMutation(row.original.id);
//   const queryClient = useQueryClient();

//   return (
//     <StatusesCombobox
//       statusValue={selectedStatusValue}
//       onSelect={(newStatusValue) => {
//         mutateAsync({
//           assigneeUserId: row.original.assignee.userId,
//           description: row.original.description,
//           invoiceAmount: null, // TODO
//           taskStatus: newStatusValue as
//             | "Not Started"
//             | "In Progress"
//             | "On Hold"
//             | "Completed"
//             | "Canceled",
//         })
//           .then(() => {
//             queryClient.invalidateQueries({
//               queryKey: ["jobs", "detail", row.original.jobId],
//             });
//             queryClient.invalidateQueries({
//               queryKey: ["projects", "detail", row.original.projectId],
//             });
//           })
//           .catch(() => {});
//       }}
//       buttonClassName="w-full max-w-[268px]"
//       buttonSize={"sm"}
//     />
//   );
// }

// interface AssigneeProps {
//   cellContext: CellContext<
//     TaskTableRowData,
//     {
//       userId: string | null;
//       name: string | null;
//     }
//   >;
// }

// function Assignee({ cellContext: { getValue, row } }: AssigneeProps) {
//   /**
//    * State
//    */
//   const { userId } = getValue();

//   /**
//    * Query
//    */
//   const { data: paginatedUsers, isLoading: isUsersQueryLoading } =
//     useAllUsersByOrganizationIdQuery("asda");
//   const { mutateAsync } = usePatchOrderedTaskMutation(row.original.id);
//   const queryClient = useQueryClient();

//   return (
//     <AssigneeCombobox
//       userId={userId ?? ""}
//       onUnassign={() => {
//         mutateAsync({
//           assigneeUserId: null,
//           description: row.original.description,
//           invoiceAmount: null, // TODO
//           taskStatus: row.original.status as
//             | "Not Started"
//             | "In Progress"
//             | "On Hold"
//             | "Completed"
//             | "Canceled",
//         })
//           .then(() => {
//             queryClient.invalidateQueries({
//               queryKey: ["jobs", "detail", row.original.jobId],
//             });
//             queryClient.invalidateQueries({
//               queryKey: ["projects", "detail", row.original.projectId],
//             });
//           })
//           .catch(() => {});
//       }}
//       onSelect={(newUserId) => {
//         mutateAsync({
//           assigneeUserId: newUserId,
//           description: row.original.description,
//           invoiceAmount: null, // TODO
//           taskStatus: row.original.status as
//             | "Not Started"
//             | "In Progress"
//             | "On Hold"
//             | "Completed"
//             | "Canceled",
//         })
//           .then(() => {
//             queryClient.invalidateQueries({
//               queryKey: ["jobs", "detail", row.original.jobId],
//             });
//             queryClient.invalidateQueries({
//               queryKey: ["projects", "detail", row.original.projectId],
//             });
//           })
//           .catch(() => {});
//       }}
//       buttonClassName="w-full max-w-[268px]"
//       buttonSize={"sm"}
//     />
//   );
// }

// const columnHelper = createColumnHelper<TaskTableRowData>();

// export const taskTableColumns = [
//   columnHelper.accessor("name", {
//     header: "Name",
//     size: 350,
//     cell: ({ getValue }) => (
//       <p className="w-[318px] whitespace-nowrap overflow-hidden text-ellipsis">
//         {getValue()}
//       </p>
//     ),
//   }),
//   columnHelper.accessor("description", {
//     header: "Description",
//     size: 300,
//     cell: ({ getValue }) => {
//       const value = getValue();

//       if (value == null || value === "") {
//         return <p className="text-muted-foreground">-</p>;
//       }

//       return (
//         <p className="w-[268px] whitespace-nowrap overflow-hidden text-ellipsis">
//           {value}
//         </p>
//       );
//     },
//   }),
//   columnHelper.accessor("status", {
//     header: "Status",
//     size: 300,
//     cell: (cellContext) => {
//       return <Status cellContext={cellContext} />;
//     },
//   }),
//   columnHelper.accessor("assignee", {
//     header: "Assignee",
//     size: 300,
//     cell: (cellContext) => {
//       return <Assignee cellContext={cellContext} />;
//     },
//   }),
// ];
