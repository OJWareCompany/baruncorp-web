"use client";
import React, { useState } from "react";
import { DayContent, DayContentProps } from "react-day-picker";
import { useQueryClient } from "@tanstack/react-query";
import { format, isWithinInterval, startOfDay, subMonths } from "date-fns";
import PtoDialog from "./PtoDialog";
import PtoDetailsTable from "./PtoDetailsTable";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import useProfileQuery from "@/queries/useProfileQuery";

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
  const target = ptoItems.find((value) => {
    const isDateWithin = isWithinInterval(startOfDay(props.date), {
      start: startOfDay(new Date(value.startedAt)),
      end: startOfDay(new Date(value.endedAt)),
    });
    return isDateWithin;
  });

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={"ghost"}
            className="w-full h-full p-0 font-normal rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 relative items-stretch justify-start flex-col [&:hover>#header]:bg-accent"
            disabled={props.activeModifiers.disabled}
          >
            <div
              id="header"
              className={cn(
                "text-left p-2 border-b bg-slate-50 transition-colors",
                props.activeModifiers.today && "bg-accent"
              )}
            >
              <DayContent {...props} />
            </div>
            {target != null && (
              <div className="p-2">
                <Badge
                  className={`w-full rounded-sm ${
                    ptoTypes[target.ptoTypeName as PtoTypeEnum].color
                  }`}
                  variant={"outline"}
                >
                  {`${target.ptoTypeName} · ${target.amount / target.days}`}
                </Badge>
              </div>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel>
            {format(props.date, "MM-dd-yyyy")}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {target == null ? (
            <DropdownMenuItem
              onClick={() => {
                addPto(props.date);
              }}
            >
              Add
            </DropdownMenuItem>
          ) : (
            <>
              <DropdownMenuItem
                onClick={() => {
                  modifyPto(target);
                }}
              >
                Modify
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  deletePto(target.id);
                }}
                className="text-destructive focus:text-destructive"
              >
                Delete
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

export type PtoDialogState =
  | { open: false }
  | { open: true; type: "Add"; from: Date }
  | { open: true; type: "Modify"; pto: PtoDetailResponseDto };

interface Props {
  userId: string;
}

export default function PtoDetails({ userId }: Props) {
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
      userId,
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
      userId,
      limit: Number.MAX_SAFE_INTEGER,
      targetMonth: format(month, "yyyy-MM"),
    },
    true
  );
  const { data: profile } = useProfileQuery();

  const isFetching =
    isPreviousMonthPtoDetailsQueryFetching ||
    isCurrentMonthPtoDetailsQueryFetching;

  return (
    <>
      <div className="space-y-4">
        <PtoCalendar
          dateOfJoining={profile?.dateOfJoining}
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
          userId={userId}
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
                    queryKey: getPtoDetailsQueryKey({
                      userId,
                    }),
                  });
                  queryClient.invalidateQueries({
                    queryKey: getPtosQueryKey({
                      userId,
                      limit: Number.MAX_SAFE_INTEGER,
                    }),
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
