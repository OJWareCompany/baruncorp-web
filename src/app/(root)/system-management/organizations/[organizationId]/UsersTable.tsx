"use client";
import {
  PaginationState,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
  Mail,
  MoreHorizontal,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FindUsersHttpControllerGetFindUsersParams,
  OrganizationResponseDto,
  UserPaginatedResponseDto,
} from "@/api/api-spec";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import useUsersQuery, { getUsersQueryKey } from "@/queries/useUsersQuery";
import { Checkbox } from "@/components/ui/checkbox";
import {
  BARUNCORP_ORGANIZATION_ID,
  UserStatusEnum,
  YesOrNoEnum,
  transformUserStatusEnumWithEmptyStringIntoNullableUserStatusEnum,
  transformYesOrNoEnumWithEmptyStringIntoNullableBoolean,
  userStatuses,
} from "@/lib/constants";
import SearchHeader from "@/components/table/SearchHeader";
import EnumHeader from "@/components/table/EnumHeader";
import useOnPaginationChange from "@/hook/useOnPaginationChange";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import usePostInvitationsMutation from "@/mutations/usePostInvitationsMutation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import LoadingButton from "@/components/LoadingButton";

const columnHelper =
  createColumnHelper<UserPaginatedResponseDto["items"][number]>();

interface Props {
  organization: OrganizationResponseDto;
}

export default function UsersTable({ organization }: Props) {
  const [alertDialogState, setAlertDialogState] = useState<
    { open: false } | { open: true; email: string; organizationId: string }
  >({ open: false });
  const router = useRouter();
  const searchParams = useSearchParams();
  const [syncedParams, setSyncedParams] =
    useState<FindUsersHttpControllerGetFindUsersParams>();

  const {
    mutateAsync: postInvitationsMutateAsync,
    isPending: isPostInvitationsMutationPending,
  } = usePostInvitationsMutation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const emailSearchParamName = "Email";
  const userNameSearchParamName = "UserName";
  const statusSearchParamName = "Status";
  const contractorSearchParamName = "Contractor";
  const pageIndexSearchParamName = "PageIndex";
  const pageSizeSearchParamName = "PageSize";
  const pagination: PaginationState = {
    pageIndex: searchParams.get(pageIndexSearchParamName)
      ? Number(searchParams.get(pageIndexSearchParamName))
      : 0,
    pageSize: searchParams.get(pageSizeSearchParamName)
      ? Number(searchParams.get(pageSizeSearchParamName))
      : 10,
  };
  const userNameSearchParam = searchParams.get(userNameSearchParamName) ?? "";
  const emailSearchParam = searchParams.get(emailSearchParamName) ?? "";
  const contractorSearchParamParseResult = YesOrNoEnum.safeParse(
    searchParams.get(contractorSearchParamName)
  );
  const contractorSearchParam = contractorSearchParamParseResult.success
    ? contractorSearchParamParseResult.data
    : "";
  const statusSearchParamParseResult = UserStatusEnum.safeParse(
    searchParams.get(statusSearchParamName)
  );
  const statusSearchParam = statusSearchParamParseResult.success
    ? statusSearchParamParseResult.data
    : "";

  const onPaginationChange = useOnPaginationChange({
    pageIndexSearchParamName,
    pageSizeSearchParamName,
    pagination,
  });

  const params: FindUsersHttpControllerGetFindUsersParams = useMemo(
    () => ({
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      organizationId: organization.id,
      userName: userNameSearchParam,
      email: emailSearchParam,
      isContractor:
        transformYesOrNoEnumWithEmptyStringIntoNullableBoolean.parse(
          contractorSearchParam
        ),
      status:
        transformUserStatusEnumWithEmptyStringIntoNullableUserStatusEnum.parse(
          statusSearchParam
        ),
    }),
    [
      pagination.pageIndex,
      pagination.pageSize,
      organization.id,
      userNameSearchParam,
      emailSearchParam,
      contractorSearchParam,
      statusSearchParam,
    ]
  );

  const { data, isLoading, isFetching } = useUsersQuery(params, true);

  useEffect(() => {
    if (!isFetching) {
      setSyncedParams(params);
    }
  }, [isFetching, params]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("fullName", {
        header: () => (
          <SearchHeader
            buttonText="Name"
            searchParamName={userNameSearchParamName}
            pageIndexSearchParamName={pageIndexSearchParamName}
            isLoading={
              syncedParams != null && params.userName !== syncedParams.userName
            }
          />
        ),
      }),
      columnHelper.accessor("email", {
        header: () => (
          <SearchHeader
            buttonText="Email"
            searchParamName={emailSearchParamName}
            pageIndexSearchParamName={pageIndexSearchParamName}
            isLoading={
              syncedParams != null && params.email !== syncedParams.email
            }
          />
        ),
      }),
      columnHelper.accessor("phoneNumber", {
        header: "Phone Number",
        cell: ({ getValue }) => {
          const value = getValue();

          if (value == null) {
            return <p className="text-muted-foreground">-</p>;
          }

          return value;
        },
      }),
      columnHelper.accessor("isVendor", {
        header: () => (
          <EnumHeader
            buttonText="Contractor"
            searchParamName={contractorSearchParamName}
            pageIndexSearchParamName={pageIndexSearchParamName}
            zodEnum={YesOrNoEnum}
            isLoading={
              syncedParams != null &&
              params.isContractor !== syncedParams.isContractor
            }
          />
        ),
        cell: ({ getValue, row }) => {
          if (row.original.organizationId === BARUNCORP_ORGANIZATION_ID) {
            return <p className="text-muted-foreground">-</p>;
          }

          return <Checkbox checked={getValue()} />;
        },
      }),
      columnHelper.accessor("status", {
        header: () => (
          <EnumHeader
            buttonText="Status"
            searchParamName={statusSearchParamName}
            pageIndexSearchParamName={pageIndexSearchParamName}
            zodEnum={UserStatusEnum}
            isLoading={
              syncedParams != null && params.status !== syncedParams.status
            }
          />
        ),
        cell: ({ getValue }) => {
          const value = getValue();
          const status = userStatuses[value];

          return (
            <div className={`flex items-center`}>
              <status.Icon className={`w-4 h-4 mr-2 ${status.color}`} />
              <span className="whitespace-nowrap">{status.value}</span>
            </div>
          );
        },
      }),
      columnHelper.accessor("dateOfJoining", {
        header: "Date of Joining",
        cell: ({ getValue }) => {
          const value = getValue();
          if (value == null) {
            return <p className="text-muted-foreground">-</p>;
          }

          return format(new Date(value), "MM-dd-yyyy");
        },
      }),
      columnHelper.display({
        id: "action",
        cell: ({ row }) => {
          const { status, email, organizationId } = row.original;

          if (
            status !== "Invitation Sent" &&
            status !== "Invitation Not Sent"
          ) {
            return null;
          }

          return (
            <div className="text-right">
              <div
                className="inline-flex"
                onClick={(event) => {
                  event.stopPropagation();
                }}
              >
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant={"ghost"} size={"icon"} className="h-9 w-9">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        setAlertDialogState({
                          open: true,
                          email,
                          organizationId,
                        });
                      }}
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      {status === "Invitation Sent"
                        ? "Resend Invitation Email"
                        : "Send Invitation Email"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          );
        },
      }),
    ],
    [params, syncedParams]
  );

  const table = useReactTable({
    data: data?.items ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: ({ id }) => id,
    pageCount: data?.totalPage ?? -1,
    onPaginationChange,
    manualPagination: true,
    state: {
      pagination,
      columnVisibility: {
        dateOfJoining: organization.id === BARUNCORP_ORGANIZATION_ID,
        isVendor: organization.id !== BARUNCORP_ORGANIZATION_ID,
      },
    },
  });

  return (
    <>
      <div className="space-y-2">
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
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24">
                    <div className="flex justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    onClick={() => {
                      router.push(`/system-management/users/${row.id}`);
                    }}
                    className="cursor-pointer"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex justify-end items-center">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">Rows per page</p>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value));
                }}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[5, 10, 25, 50, 100].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="h-8 w-8"
                size={"icon"}
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8"
                size={"icon"}
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8"
                size={"icon"}
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8"
                size={"icon"}
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      <AlertDialog
        open={alertDialogState.open}
        onOpenChange={(newOpen) => {
          if (newOpen) {
            return;
          }

          setAlertDialogState({ open: newOpen });
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <LoadingButton
              isLoading={isPostInvitationsMutationPending}
              onClick={() => {
                if (!alertDialogState.open) {
                  return;
                }

                postInvitationsMutateAsync({
                  email: alertDialogState.email,
                  organizationId: alertDialogState.organizationId,
                })
                  .then(() => {
                    toast({ title: "Success" });
                    queryClient.invalidateQueries({
                      queryKey: getUsersQueryKey({
                        organizationId: organization.id,
                      }),
                    });
                    setAlertDialogState({ open: false });
                  })
                  .catch((error: AxiosError<ErrorResponseData>) => {
                    if (
                      error.response &&
                      error.response.data.errorCode.filter(
                        (value) => value != null
                      ).length !== 0
                    ) {
                      toast({
                        title: error.response.data.message,
                        variant: "destructive",
                      });
                      return;
                    }
                  });
                return;
              }}
            >
              Continue
            </LoadingButton>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
