import React, { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import ReasonForm from "./ReasonForm";
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
import { getProjectQueryKey } from "@/queries/useProjectQuery";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const [alertDialogState, setAlertDialogState] = useState<
    { open: false } | { open: true; type: "Complete" }
  >({ open: false });
  const [dialogOpen, setDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { mutateAsync: patchAssignedTaskCompleteMutateAsync } =
    usePatchAssignedTaskCompleteMutation(assignedTaskId);

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
                setAlertDialogState({ open: true, type: "Complete" });
              }}
            >
              Complete
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                setDialogOpen(true);
              }}
              className="text-destructive focus:text-destructive"
            >
              Reject
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <AlertDialog
          open={alertDialogState.open}
          onOpenChange={(newOpen) => {
            if (!newOpen) {
              setAlertDialogState({ open: false });
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
                  if (!alertDialogState.open) {
                    return;
                  }

                  if (alertDialogState.type === "Complete") {
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
                }}
              >
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reason for rejection</DialogTitle>
            </DialogHeader>
            <ReasonForm
              assignedTaskId={assignedTaskId}
              onSuccess={() => {
                setDialogOpen(false);
                queryClient.invalidateQueries({
                  queryKey: getJobQueryKey(jobId),
                });
                queryClient.invalidateQueries({
                  queryKey: getProjectQueryKey(projectId),
                });
              }}
            />
          </DialogContent>
        </Dialog>
      </>
    );
  }
}
