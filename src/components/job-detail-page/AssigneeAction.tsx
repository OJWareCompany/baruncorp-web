import React from "react";
import { MoreHorizontal } from "lucide-react";
import { useSession } from "next-auth/react";
import { useAlertDialogDataDispatch } from "./AlertDialogDataProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useProfileContext } from "@/app/(root)/ProfileProvider";
import { AssignedTaskStatusEnum } from "@/lib/constants";

interface Props {
  assignedTaskId: string;
  jobId: string;
  projectId: string;
  userId: string;
  status: AssignedTaskStatusEnum;
  openReasonDialog: (assignedTaskId: string) => void;
}

export default function AssigneeAction({
  assignedTaskId,
  jobId,
  projectId,
  userId,
  status,
  openReasonDialog,
}: Props) {
  const dispatch = useAlertDialogDataDispatch();
  const { data: session } = useSession();

  const { isBarunCorpMember } = useProfileContext();
  const isMine = session?.id === userId;

  if (isBarunCorpMember) {
    switch (status) {
      case "Not Started":
        return (
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
              <DropdownMenuItem
                onClick={() => {
                  dispatch({
                    type: "UPDATE_TASK_TO_HOLD",
                    assignedTaskId,
                    jobId,
                    projectId,
                  });
                }}
              >
                Hold
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  dispatch({
                    type: "UPDATE_TASK_TO_CANCEL",
                    assignedTaskId,
                    jobId,
                    projectId,
                  });
                }}
                className="text-destructive focus:text-destructive"
              >
                Cancel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      case "On Hold":
        return (
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
              <DropdownMenuItem
                onClick={() => {
                  if (userId === "") {
                    dispatch({
                      type: "UPDATE_TASK_TO_NOT_STARTED",
                      assignedTaskId,
                      jobId,
                      projectId,
                    });
                  } else {
                    dispatch({
                      type: "UPDATE_TASK_TO_IN_PROGRESS",
                      assignedTaskId,
                      jobId,
                      projectId,
                    });
                  }
                }}
              >
                Reset
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      case "In Progress":
        return (
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
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  dispatch({
                    type: "UPDATE_TASK_TO_HOLD",
                    assignedTaskId,
                    jobId,
                    projectId,
                  });
                }}
              >
                Hold
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  dispatch({
                    type: "UPDATE_TASK_TO_CANCEL",
                    assignedTaskId,
                    jobId,
                    projectId,
                  });
                }}
                className="text-destructive focus:text-destructive"
              >
                Cancel
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  dispatch({
                    type: "UNASSIGN_TASK",
                    assignedTaskId,
                    jobId,
                    projectId,
                  });
                }}
                className="text-destructive focus:text-destructive"
              >
                Unassign
              </DropdownMenuItem>
              {isMine && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      openReasonDialog(assignedTaskId);
                    }}
                    className="text-destructive focus:text-destructive"
                  >
                    Reject
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      case "Completed":
        return (
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
              <DropdownMenuItem
                onClick={() => {
                  dispatch({
                    type: "UPDATE_TASK_TO_IN_PROGRESS",
                    assignedTaskId,
                    jobId,
                    projectId,
                  });
                }}
              >
                Reset
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      case "Canceled":
        return (
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
              <DropdownMenuItem
                onClick={() => {
                  if (userId === "") {
                    dispatch({
                      type: "UPDATE_TASK_TO_NOT_STARTED",
                      assignedTaskId,
                      jobId,
                      projectId,
                    });
                  } else {
                    dispatch({
                      type: "UPDATE_TASK_TO_IN_PROGRESS",
                      assignedTaskId,
                      jobId,
                      projectId,
                    });
                  }
                }}
              >
                Reset
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
    }
  }

  if (isMine) {
    switch (status) {
      case "In Progress":
        return (
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
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  openReasonDialog(assignedTaskId);
                }}
                className="text-destructive focus:text-destructive"
              >
                Reject
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
    }
  }
}
