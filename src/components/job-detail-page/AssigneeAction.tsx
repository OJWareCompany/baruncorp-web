import React, { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import { useAlertDialogDataDispatch } from "./AlertDialogDataProvider";
import ReasonForm from "./ReasonForm";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getJobQueryKey } from "@/queries/useJobQuery";
import { getProjectQueryKey } from "@/queries/useProjectQuery";

interface Props {
  assignedTaskId: string;
  jobId: string;
  projectId: string;
  userId: string;
}

export default function AssigneeAction({
  assignedTaskId,
  jobId,
  projectId,
  userId,
}: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const dispatch = useAlertDialogDataDispatch();
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const isBarunCorpMember = session?.isBarunCorpMember ?? false;
  const isMine = session?.id === userId;

  if (!isMine && !isBarunCorpMember) {
    return null;
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={"outline"}
            size={"icon"}
            className="h-8 w-8 flex-shrink-0"
          >
            <MoreHorizontal className="w-3 h-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {(isMine || isBarunCorpMember) && (
            <DropdownMenuItem
              onClick={() => {
                dispatch({
                  type: "UPDATE_TASK_TO_COMPLETE",
                  assignedTaskId,
                  jobId,
                  projectId,
                });
              }}
            >
              Complete
            </DropdownMenuItem>
          )}
          {isBarunCorpMember && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  dispatch({
                    type: "UNASSIGN",
                    assignedTaskId,
                    jobId,
                    projectId,
                  });
                }}
                className="text-destructive focus:text-destructive"
              >
                Unassign
              </DropdownMenuItem>
            </>
          )}
          {isMine && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setDialogOpen(true);
                }}
                className="text-destructive focus:text-destructive"
              >
                Reject
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
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
