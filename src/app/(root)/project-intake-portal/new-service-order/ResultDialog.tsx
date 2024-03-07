"use client";
import { DialogProps } from "@radix-ui/react-dialog";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useProfileContext } from "../../ProfileProvider";
import { ResultDialogState } from "./JobSection";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import useJobQuery from "@/queries/useJobQuery";
import { errorToastDescription } from "@/lib/constants";
import { toast } from "@/components/ui/use-toast";
import usePostJobFilesMutation from "@/mutations/usePostJobFilesMutation";

interface Props extends DialogProps {
  onOpenChange: (open: boolean) => void;
  state: ResultDialogState;
}

export default function ResultDialog({ state, ...dialogProps }: Props) {
  const { isBarunCorpMember } = useProfileContext();
  const router = useRouter();
  const { data: job } = useJobQuery(state.open ? state.jobId : "");

  const [postJobFilesProgress, setPostJobFilesProgress] = useState({
    value: 0,
    error: false,
  });

  const { mutateAsync: postJobNoteFilesMutateAsync } = usePostJobFilesMutation({
    onUploadProgress: (axiosProgressEvent) => {
      setPostJobFilesProgress({
        value: (axiosProgressEvent?.progress ?? 0) * 100,
        error: false,
      });
    },
  });

  useEffect(() => {
    if (!state.open) {
      setPostJobFilesProgress({
        value: 0,
        error: false,
      });
      return;
    }

    if (state.files.length === 0 || job == null || job.jobFolderId == null) {
      return;
    }

    postJobNoteFilesMutateAsync({
      files: state.files,
      jobFolderId: job.jobFolderId,
    }).catch(() => {
      toast({
        title: "Upload failed",
        description: errorToastDescription,
        variant: "destructive",
      });
    });
  }, [job, postJobNoteFilesMutateAsync, state]);

  return (
    <Dialog
      {...dialogProps}
      open={state.open}
      onOpenChange={(newOpen) => {
        if (postJobFilesProgress.value !== 100) {
          return;
        }

        dialogProps.onOpenChange(newOpen);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Order Completed</DialogTitle>
          <DialogDescription>
            {state.open && state.files.length !== 0
              ? "It may take some time for files to appear in Google Drive after uploading."
              : "You can place more orders or go to the details page for your order details."}
          </DialogDescription>
        </DialogHeader>
        {state.open && state.files.length !== 0 && (
          <div className="flex flex-col gap-1">
            <Progress value={postJobFilesProgress.value} />
            <p
              className={cn(
                "text-xs text-muted-foreground text-center",
                postJobFilesProgress.error && "text-destructive"
              )}
            >
              {postJobFilesProgress.value !== 100
                ? "Please wait for the file to upload..."
                : postJobFilesProgress.error
                ? "Failed to upload file"
                : "Completed to upload file"}
            </p>
          </div>
        )}
        <DialogFooter>
          <Button
            variant={"outline"}
            onClick={() => {
              dialogProps.onOpenChange(false);
            }}
            disabled={
              state.open &&
              state.files.length !== 0 &&
              postJobFilesProgress.value !== 100
            }
          >
            Order More
          </Button>
          <Button
            onClick={() => {
              if (!state.open) {
                return;
              }

              router.push(`/jobs/${state.jobId}`);
            }}
            disabled={
              state.open &&
              state.files.length !== 0 &&
              postJobFilesProgress.value !== 100
            }
          >
            View Detail
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
