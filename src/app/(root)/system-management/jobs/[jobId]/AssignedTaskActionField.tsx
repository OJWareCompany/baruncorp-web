import React, { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { JobStatusEnum } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import usePatchAssignedTaskCompleteMutation from "@/mutations/usePatchAssignedTaskCompleteMutation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getJobQueryKey } from "@/queries/useJobQuery";
import usePatchAssignedTaskUnassignMutation from "@/mutations/usePatchAssignedTaskUnassignMutation";
import { getProjectQueryKey } from "@/queries/useProjectQuery";

interface Props {
  assignedTaskId: string;
  status: JobStatusEnum;
  jobId: string;
  projectId: string;
}

export default function AssignedTaskActionField({
  assignedTaskId,
  status,
  jobId,
  projectId,
}: Props) {
  const [state, setState] = useState<
    | { alertDialogOpen: false }
    | { alertDialogOpen: true; type: "Complete" | "Unassign" }
  >({ alertDialogOpen: false });
  const queryClient = useQueryClient();
  const { mutateAsync: patchAssignedTaskCompleteMutateAsync } =
    usePatchAssignedTaskCompleteMutation(assignedTaskId);
  const { mutateAsync: patchAssignedTaskUnassignMutateAsync } =
    usePatchAssignedTaskUnassignMutation(assignedTaskId);

  const isInProgress = status === JobStatusEnum.Values["In Progress"];

  if (isInProgress) {
    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant={"ghost"} size={"icon"} className="h-9 w-9">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                setState({ alertDialogOpen: true, type: "Complete" });
              }}
            >
              Complete
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                setState({ alertDialogOpen: true, type: "Unassign" });
              }}
              className="text-destructive focus:text-destructive"
            >
              Unassign
            </DropdownMenuItem>
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

                  if (state.type === "Complete") {
                    patchAssignedTaskCompleteMutateAsync()
                      .then(() => {
                        queryClient.invalidateQueries({
                          queryKey: getJobQueryKey(jobId),
                        });
                        queryClient.invalidateQueries({
                          queryKey: getProjectQueryKey(projectId),
                        });
                      })
                      .catch(() => {
                        // TODO: error handling
                      });
                    return;
                  }

                  if (state.type === "Unassign") {
                    patchAssignedTaskUnassignMutateAsync()
                      .then(() => {
                        queryClient.invalidateQueries({
                          queryKey: getJobQueryKey(jobId),
                        });
                        queryClient.invalidateQueries({
                          queryKey: getProjectQueryKey(projectId),
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
    );
  }
}
