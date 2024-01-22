"use client";
import React, { useState } from "react";
import { DayContent, DayContentProps } from "react-day-picker";
import { useQueryClient } from "@tanstack/react-query";
import { format, isWithinInterval, startOfDay, subMonths } from "date-fns";
import PtoDialog from "./PtoDialog";
import PtoDetailsTable from "./PtoDetailsTable";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PtoDetailResponseDto } from "@/api";
import useDeletePtoDetailMutation from "@/mutations/useDeletePtoDetailMutation";
import usePtoDetailsQuery, {
  getPtoDetailsQueryKey,
} from "@/queries/usePtoDetailsQuery";
import { getPtosQueryKey } from "@/queries/usePtosQuery";
import { Badge } from "@/components/ui/badge";
import { PtoTypeEnum, ptoTypes } from "@/lib/constants";
import PtoCalendar from "@/components/PtoCalendar";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

interface CustomDayContentProps extends DayContentProps {
  deletePto: (ptoId: string) => void;
  addPto: (from: Date) => void;
  modifyPto: (target: PtoDetailResponseDto) => void;
  ptoItems: PtoDetailResponseDto[];
}

function CustomDayContent({
  ptoItems,
  deletePto,
  addPto,
  modifyPto,
  ...props
}: CustomDayContentProps) {
  const targets = ptoItems.filter((value) => {
    const isDateWithin = isWithinInterval(startOfDay(props.date), {
      start: startOfDay(new Date(value.startedAt)),
      end: startOfDay(new Date(value.endedAt)),
    });
    return isDateWithin;
  });

  targets.sort((a, b) =>
    `${a.userFirstName} ${a.userLastName}`
      .toLowerCase()
      .localeCompare(`${b.userFirstName} ${b.userLastName}`.toLowerCase())
  );

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={"ghost"}
            className="w-full h-full p-0 font-normal rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 relative items-stretch justify-start flex-col overflow-y-auto [&:hover>#header]:bg-accent"
            disabled={props.activeModifiers.disabled}
          >
            <div
              id="header"
              className={cn(
                "text-left sticky top-0 p-2 border-b bg-slate-50 transition-colors",
                props.activeModifiers.today && "bg-accent"
              )}
            >
              <DayContent {...props} />
            </div>
            {targets.length !== 0 && (
              <div className="p-2 flex flex-col gap-1">
                {targets.map((value) => (
                  <Badge
                    className="w-full rounded-sm gap-1.5 items-center"
                    variant={"outline"}
                    key={value.id}
                  >
                    <span className="flex-1 text-left whitespace-nowrap text-ellipsis overflow-hidden">
                      {`${value.userFirstName} ${value.userLastName}`}
                    </span>
                    <span
                      className={`${
                        ptoTypes[value.ptoTypeName as PtoTypeEnum].color
                      }`}
                    >{`${value.ptoTypeName} · ${
                      value.amount / value.days
                    }`}</span>
                  </Badge>
                ))}
              </div>
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start">
          <DropdownMenuLabel>
            {format(props.date, "MM-dd-yyyy")}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={() => {
                addPto(props.date);
              }}
            >
              Add
            </DropdownMenuItem>
            {targets.length !== 0 && (
              <>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>Modify</DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="p-0">
                    <Command>
                      <CommandInput placeholder="Search" autoFocus={true} />
                      <CommandEmpty>No user found.</CommandEmpty>
                      <CommandList>
                        <CommandGroup>
                          {targets.map((value) => (
                            <CommandItem
                              key={value.id}
                              onSelect={() => {
                                modifyPto(value);
                              }}
                            >
                              {`${value.userFirstName} ${value.userLastName}`}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="text-destructive [&>svg]:text-popover-foreground">
                    Delete
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="p-0">
                    <Command>
                      <CommandInput placeholder="Search" autoFocus={true} />
                      <CommandEmpty>No user found.</CommandEmpty>
                      <CommandList>
                        <CommandGroup>
                          {targets.map((value) => (
                            <CommandItem
                              key={value.id}
                              onSelect={() => {
                                deletePto(value.id);
                              }}
                            >
                              {`${value.userFirstName} ${value.userLastName}`}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </>
            )}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

export type PtoDialogState =
  | { open: false }
  | { open: true; type: "Add"; from: Date }
  | { open: true; type: "Modify"; pto: PtoDetailResponseDto };

export default function PtoDetails() {
  const currentDate = new Date();
  const [month, setMonth] = useState<Date>(currentDate);
  const [alertDialogState, setAlertDialogState] = useState<
    { open: false } | { open: true; ptoId: string }
  >({ open: false });
  const [ptoDialogState, setPtoDialogState] = useState<PtoDialogState>({
    open: false,
  });

  const { mutateAsync: deletePtoDetailMutateAsync } =
    useDeletePtoDetailMutation();
  const queryClient = useQueryClient();

  const {
    data: previousMonthPtoDetails,
    isFetching: isPreviousMonthPtoDetailsQueryFetching,
  } = usePtoDetailsQuery(
    {
      limit: Number.MAX_SAFE_INTEGER,
      targetMonth: format(subMonths(month, 1), "yyyy-MM"),
    },
    true
  );
  const {
    data: currentMonthPtoDetails,
    isFetching: isCurrentMonthPtoDetailsQueryFetching,
  } = usePtoDetailsQuery(
    {
      limit: Number.MAX_SAFE_INTEGER,
      targetMonth: format(month, "yyyy-MM"),
    },
    true
  );

  const isFetching =
    isPreviousMonthPtoDetailsQueryFetching ||
    isCurrentMonthPtoDetailsQueryFetching;

  return (
    <>
      <div className="space-y-4">
        <PtoCalendar
          month={month}
          onMonthChange={setMonth}
          isFetching={isFetching}
          DayContent={(props) => {
            return (
              <CustomDayContent
                {...props}
                ptoItems={
                  previousMonthPtoDetails != null &&
                  currentMonthPtoDetails != null
                    ? [
                        ...previousMonthPtoDetails.items,
                        ...currentMonthPtoDetails.items,
                      ]
                    : []
                }
                deletePto={(ptoId) => {
                  setAlertDialogState({ open: true, ptoId });
                }}
                addPto={(from) => {
                  setPtoDialogState({
                    open: true,
                    type: "Add",
                    from,
                  });
                }}
                modifyPto={(target) => {
                  setPtoDialogState({
                    open: true,
                    type: "Modify",
                    pto: target,
                  });
                }}
              />
            );
          }}
        />
        <PtoDetailsTable
          deletePto={(ptoId) => {
            setAlertDialogState({ open: true, ptoId });
          }}
          modifyPto={(target) => {
            setPtoDialogState({
              open: true,
              type: "Modify",
              pto: target,
            });
          }}
        />
      </div>
      <PtoDialog
        state={ptoDialogState}
        onOpenChange={(newOpen) => {
          if (newOpen) {
            return;
          }

          setPtoDialogState({ open: newOpen });
        }}
      />

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
            <AlertDialogAction
              onClick={() => {
                if (!alertDialogState.open) {
                  return;
                }

                deletePtoDetailMutateAsync({
                  ptoId: alertDialogState.ptoId,
                }).then(() => {
                  queryClient.invalidateQueries({
                    queryKey: getPtoDetailsQueryKey({}),
                  });
                  queryClient.invalidateQueries({
                    queryKey: getPtosQueryKey({}),
                  });
                });
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
