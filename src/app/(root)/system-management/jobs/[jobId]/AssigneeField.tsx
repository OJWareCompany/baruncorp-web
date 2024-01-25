import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import AssigneeCombobox from "@/components/combobox/AssigneeCombobox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import usePatchAssignMutation from "@/mutations/usePatchAssignMutation";
import { getJobQueryKey } from "@/queries/useJobQuery";
import { JobStatusEnum } from "@/lib/constants";
import { getProjectQueryKey } from "@/queries/useProjectQuery";
import { useToast } from "@/components/ui/use-toast";

interface Props {
  assignedTaskId: string;
  userId: string;
  status: JobStatusEnum;
  jobId: string;
  projectId: string;
}

export default function AssigneeField({
  assignedTaskId,
  userId,
  status,
  jobId,
  projectId,
}: Props) {
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { mutateAsync } = usePatchAssignMutation(assignedTaskId);

  return (
    <>
      <AssigneeCombobox
        assignedTaskId={assignedTaskId}
        userId={userId}
        onUserIdChange={(newUserId) => {
          setAlertDialogOpen(true);
          setSelectedUserId(newUserId);
        }}
        disabled={
          status === "Completed" ||
          status === "On Hold" ||
          status === "Canceled"
        }
      />
      <AlertDialog open={alertDialogOpen} onOpenChange={setAlertDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                mutateAsync({
                  assigneeId: selectedUserId,
                })
                  .then(() => {
                    queryClient.invalidateQueries({
                      queryKey: getJobQueryKey(jobId),
                    });
                    queryClient.invalidateQueries({
                      queryKey: getProjectQueryKey(projectId),
                    });
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
