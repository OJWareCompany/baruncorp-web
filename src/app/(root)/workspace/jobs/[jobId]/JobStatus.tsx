import { MoreHorizontal } from "lucide-react";
import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { JobResponseDto } from "@/api";
import { Button } from "@/components/ui/button";
import { JobStatusEnum, jobStatuses } from "@/lib/constants";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import usePatchJobCancelMutation from "@/mutations/usePatchJobCancelMutation";
import usePatchJobHoldMutation from "@/mutations/usePatchJobHoldMutation";
import { getJobQueryKey } from "@/queries/useJobQuery";
import { getProjectQueryKey } from "@/queries/useProjectQuery";

interface Props {
  job: JobResponseDto;
}

export default function JobStatus({ job }: Props) {
  const { data: session } = useSession();
  const [state, setState] = useState<
    | { alertDialogOpen: false }
    | { alertDialogOpen: true; type: "Hold" | "Cancel" }
  >({ alertDialogOpen: false });
  const queryClient = useQueryClient();
  const { mutateAsync: patchJobCancelMutateAsync } = usePatchJobCancelMutation(
    job.id
  );
  const { mutateAsync: patchJobHoldMutateAsync } = usePatchJobHoldMutation(
    job.id
  );
  const status = jobStatuses[job.jobStatus];

  const isNotStarted = job.jobStatus === JobStatusEnum.Values["Not Started"];
  const isInProgress = job.jobStatus === JobStatusEnum.Values["In Progress"];
  const isOnHold = job.jobStatus === JobStatusEnum.Values["On Hold"];

  const hasTask = job.assignedTasks.some(
    (value) => value.assigneeId === session?.id
  );

  return (
    <div className="flex gap-2">
      <div className="flex h-10 px-3 py-2 rounded-md text-sm border border-input bg-background flex-1">
        {status && (
          <div className="flex items-center flex-1 gap-2">
            <status.Icon className={`w-4 h-4 ${status.color}`} />
            <span>{status.value}</span>
          </div>
        )}
      </div>
      {hasTask && (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant={"outline"} size={"icon"}>
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {(isNotStarted || isInProgress) && (
                <>
                  {isOnHold ? (
                    <DropdownMenuItem>TODO: Reactivate (Hold)</DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem
                      onClick={() => {
                        setState({ alertDialogOpen: true, type: "Hold" });
                      }}
                    >
                      Hold
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      setState({ alertDialogOpen: true, type: "Cancel" });
                    }}
                    className="text-destructive focus:text-destructive"
                  >
                    Cancel
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <AlertDialog
            open={state.alertDialogOpen}
            onOpenChange={(newOpen) => {
              if (!newOpen) {
                setState({ alertDialogOpen: false });
                return;
              }
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
                    if (!state.alertDialogOpen) {
                      return;
                    }

                    if (state.type === "Hold") {
                      patchJobHoldMutateAsync()
                        .then(() => {
                          queryClient.invalidateQueries({
                            queryKey: getJobQueryKey(job.id),
                          });
                          queryClient.invalidateQueries({
                            queryKey: getProjectQueryKey(job.projectId),
                          });
                        })
                        .catch(() => {
                          // TODO: error handling
                        });
                      return;
                    }

                    if (state.type === "Cancel") {
                      patchJobCancelMutateAsync()
                        .then(() => {
                          queryClient.invalidateQueries({
                            queryKey: getJobQueryKey(job.id),
                          });
                          queryClient.invalidateQueries({
                            queryKey: getProjectQueryKey(job.projectId),
                          });
                        })
                        .catch(() => {
                          // TODO: error handling
                        });
                      return;
                    }
                  }}
                >
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  );
}
