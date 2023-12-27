"use client";
import {
  ExpandedState,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { ChevronDown, ChevronsDown, CornerDownRight } from "lucide-react";
import { useSession } from "next-auth/react";
import AssignedTaskActionField from "./AssignedTaskActionField";
import OrderedServiceActionField from "./OrderedServiceActionField";
import SizeForRevisionField from "./SizeForRevisionField";
import PriceField from "./PriceField";
import DurationField from "./DurationField";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { JobResponseDto, ProjectResponseDto } from "@/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  JobStatusEnum,
  OrderedServiceStatusEnum,
  jobStatuses,
  orderedServiceStatuses,
} from "@/lib/constants";
import { cn } from "@/lib/utils";

// function Price() {
//   // const price = getValue();
//   // const { priceOverride } = row.original;
//   // const { toast } = useToast();

//   const form = useForm<PriceFormFieldValues>({
//     resolver: zodResolver(priceFormSchema),
//     defaultValues: {
//       price:
//         priceOverride != null
//           ? String(priceOverride)
//           : price == null
//           ? "0"
//           : String(price),
//     },
//   });

//   /**
//    * Query
//    */
//   const { mutateAsync } = usePatchOrderedServiceMutation(row.original.id);
//   const queryClient = useQueryClient();

//   useEffect(() => {
//     form.reset({
//       price:
//         priceOverride != null
//           ? String(priceOverride)
//           : price == null
//           ? "0"
//           : String(price),
//     });
//   }, [form, price, priceOverride]);

//   async function onSubmit(values: PriceFormFieldValues) {
//     const { price } = values;
//     if (price.length === 0) {
//       toast({
//         title: "Price is required",
//         variant: "destructive",
//       });
//       return;
//     }

//     if (!/^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$/.test(price)) {
//       toast({
//         title: "Price should be a number",
//         variant: "destructive",
//       });
//       return;
//     }

//     await mutateAsync({
//       description: row.original.description,
//       priceOverride: Number(price),
//       sizeForRevision: row.original.sizeForRevision,
//     })
//       .then(() => {
//         queryClient.invalidateQueries({
//           queryKey: ["jobs", "detail", { jobId }],
//         });
//         toast({
//           title: "Success",
//         });
//       })
//       .catch((error: AxiosError<ErrorResponseData>) => {
//         switch (error.response?.status) {
//           case 400:
//             if (error.response?.data.errorCode.includes("40002")) {
//               toast({
//                 title: "Job can not be updated after invoice is issued",
//                 variant: "destructive",
//               });
//             } else {
//               toast({
//                 title: "Price is invalid",
//                 variant: "destructive",
//               });
//             }
//             break;
//         }
//       });
//   }

//   return (
//     <Form {...form}>
//       <form
//         style={{ width: column.getSize() - 32 }}
//         className="flex gap-2"
//         onSubmit={form.handleSubmit(onSubmit)}
//       >
//         <FormField
//           control={form.control}
//           name="price"
//           render={({ field }) => (
//             <FormItem className="flex-row">
//               <FormControl>
//                 <AffixInput
//                   prefixElement={
//                     <span className="text-muted-foreground">$</span>
//                   }
//                   {...field}
//                   className="h-9"
//                 />
//               </FormControl>
//             </FormItem>
//           )}
//         />
//         <Button
//           size={"icon"}
//           variant={"outline"}
//           className="w-9 h-9 flex-shrink-0"
//           type="submit"
//           disabled={!form.formState.isDirty}
//         >
//           <Pencil className="w-4 h-4" />
//         </Button>
//       </form>
//     </Form>
//   );
// }

interface Data {
  id: string;
  name: string;
  description: string | null;
  status: JobStatusEnum | OrderedServiceStatusEnum;
  price: number | null;
  priceOverride: number | null;
  sizeForRevision: "Major" | "Minor" | null;
  duration: number | null;
  isRevision: boolean;
  assigneeId: string | null;
  assigneeName: string | null;
  serviceId: string | null;
  subRows?: Data[];
  // basePrice: number | null;
}

const columnHelper = createColumnHelper<Data>();

interface Props {
  job: JobResponseDto;
  project: ProjectResponseDto;
}

export default function TasksTable({ job, project }: Props) {
  const [expanded, setExpanded] = useState<ExpandedState>({});

  const { data: session } = useSession();

  const data = useMemo(
    () =>
      job.orderedServices.map<Data>((value) => {
        const {
          status,
          description,
          serviceName,
          price,
          orderedServiceId,
          serviceId,
          priceOverride,
          sizeForRevision,
          isRevision,
          // basePrice,
        } = value;

        const filteredAssignedTasks = job.assignedTasks.filter(
          (value) => value.orderedServiceId === orderedServiceId
        );

        return {
          description,
          id: orderedServiceId,
          name: serviceName,
          price,
          priceOverride,
          sizeForRevision:
            project.propertyType === "Residential" ? sizeForRevision : null,
          duration: filteredAssignedTasks.reduce<number | null>((prev, cur) => {
            if (cur.duration != null) {
              if (prev == null) {
                return cur.duration;
              }

              return prev + cur.duration;
            }

            return prev;
          }, null),
          isRevision,
          status,
          assigneeId: null,
          assigneeName: null,
          serviceId,
          // basePrice,
          subRows: filteredAssignedTasks.map<Data>((value) => ({
            assigneeId: value.assigneeId,
            assigneeName: value.assigneeName,
            description: value.description,
            id: value.assignTaskId,
            name: value.taskName,
            price: null,
            priceOverride: null,
            sizeForRevision: null,
            duration:
              project.propertyType === "Commercial" ? value.duration : null,
            status: value.status,
            serviceId: null,
            isRevision,
            // basePrice: null,
          })),
        };
      }),
    [job.assignedTasks, job.orderedServices, project.propertyType]
  );

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "expand",
        header: ({ table }) => (
          <Button
            variant={"ghost"}
            size={"icon"}
            className="w-9 h-9 [&[data-expand=open]>svg]:rotate-180"
            onClick={table.getToggleAllRowsExpandedHandler()}
            data-expand={table.getIsAllRowsExpanded() ? "open" : "closed"}
          >
            <ChevronsDown className="w-4 h-4 transition-transform duration-200" />
          </Button>
        ),
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
      columnHelper.accessor("isRevision", {
        header: "",
        cell: ({ row, getValue }) => {
          const isRevision = getValue();

          if (row.depth > 0) {
            return;
          }

          return isRevision ? (
            <Badge variant={"outline"}>Rev</Badge>
          ) : (
            <Badge>New</Badge>
          );
        },
      }),
      columnHelper.accessor("name", {
        header: "Name",
        cell: ({ getValue, row, column }) => {
          const value = getValue();

          if (row.depth === 0) {
            return value;
          }

          let name = value;
          if (
            row.original.description != null &&
            row.original.description !== ""
          ) {
            name = row.original.description;
          }

          return (
            <div className="flex gap-4 items-center">
              <CornerDownRight className="h-4 w-4 text-muted-foreground" />
              <p>{name}</p>
            </div>
          );
        },
      }),
      project.propertyType === "Residential"
        ? columnHelper.accessor("sizeForRevision", {
            header: "Major / Minor",
            cell: ({ row, getValue }) => {
              if (row.depth > 0) {
                return;
              }

              if (!row.original.isRevision) {
                return <p className="text-muted-foreground">-</p>;
              }

              return (
                <SizeForRevisionField
                  sizeForRevision={getValue()}
                  jobId={job.id}
                  orderedServiceId={row.id}
                />
              );
            },
          })
        : columnHelper.accessor("duration", {
            header: "Duration",
            cell: ({ row, getValue }) => {
              const duration = getValue();

              if (row.depth === 0) {
                return <DurationField duration={duration} disabled />;
              }

              return (
                <DurationField
                  duration={duration}
                  disabled={row.original.assigneeId !== session?.id}
                />
              );

              // if (!row.original.isRevision) {
              //   return <p className="text-muted-foreground">-</p>;
              // }

              // return (
              //   <SizeForRevisionField
              //     sizeForRevision={getValue()}
              //     jobId={job.id}
              //     orderedServiceId={row.id}
              //   />
              // );
            },
          }),
      columnHelper.accessor("price", {
        header: "Price",
        cell: ({ row }) => {
          if (row.depth > 0) {
            return;
          }

          return (
            <PriceField
              disabled={
                !row.original.subRows?.some(
                  (value) => value.assigneeId === session?.id
                )
              }
            />
          );
        },
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: ({ getValue, row }) => {
          const value = getValue();

          if (row.depth === 0) {
            const status =
              orderedServiceStatuses[value as OrderedServiceStatusEnum];

            return (
              <div className="flex items-center">
                <status.Icon className={`w-4 h-4 mr-2 ${status.color}`} />
                <span className="whitespace-nowrap">{status.value}</span>
              </div>
            );
          }

          const status = jobStatuses[value as JobStatusEnum];

          return (
            <div className="flex items-center">
              <status.Icon className={`w-4 h-4 mr-2 ${status.color}`} />
              <span className="whitespace-nowrap">{status.value}</span>
            </div>
          );
        },
      }),
      columnHelper.accessor("assigneeName", {
        header: "Assignee",
        cell: ({ row, getValue }) => {
          if (row.depth === 0) {
            return;
          }

          const value = getValue();
          if (value == null) {
            return <p className="text-muted-foreground">-</p>;
          }

          return value;
        },
      }),
      columnHelper.display({
        id: "action",
        cell: ({ row }) => {
          if (row.depth === 0) {
            return (
              <OrderedServiceActionField
                orderedServiceId={row.id}
                status={row.original.status as OrderedServiceStatusEnum}
                jobId={job.id}
                projectId={job.projectId}
                disabled={
                  !row.original.subRows?.some(
                    (value) => value.assigneeId === session?.id
                  )
                }
              />
            );
          }

          return (
            <AssignedTaskActionField
              assignedTaskId={row.id}
              status={row.original.status as JobStatusEnum}
              jobId={job.id}
              projectId={job.projectId}
            />
          );
        },
      }),
    ],
    [job.id, job.projectId, project.propertyType, session?.id]
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      expanded,
    },
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (originalRow) => originalRow.id,
    getSubRows: (row) => row.subRows,
    getExpandedRowModel: getExpandedRowModel(),
  });

  return (
    <div className="rounded-md border">
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
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className={cn(row.depth > 0 && "bg-muted/50")}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
