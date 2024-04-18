"use client";
import { DialogProps } from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "../ui/button";
import { JobNoteResultDialogState } from "./JobNoteForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/components/ui/use-toast";
import usePostJobNoteMutation from "@/mutations/usePostJobNoteMutation";
import usePostJobNoteFilesMutation from "@/mutations/usePostJobNoteFilesMutation";
import { getJobNotesQueryKey } from "@/queries/useJobNotesQuery";

interface Props extends DialogProps {
  onOpenChange: (open: boolean) => void;
  jobNoteResultDialogState: JobNoteResultDialogState;
  onSuccess: () => void;
}

export default function JobNoteResultDialog({
  jobNoteResultDialogState,
  onSuccess,
  ...dialogProps
}: Props) {
  const queryClient = useQueryClient();
  const [postJobNoteProgress, setPostJobNoteProgress] = useState({
    value: 0,
    error: false,
  });
  const [postJobNoteFilesProgress, setPostJobNoteFilesProgress] = useState({
    value: 0,
    error: false,
  });
  const {
    mutateAsync: postJobNoteMutateAsync,
    isSuccess: isPostJobNoteMutationSuccess,
  } = usePostJobNoteMutation({
    onUploadProgress: (axiosProgressEvent) => {
      setPostJobNoteProgress({
        value: (axiosProgressEvent?.progress ?? 0) * 100,
        error: false,
      });
    },
  });
  const { mutateAsync: postJobNoteFilesMutateAsync } =
    usePostJobNoteFilesMutation({
      onUploadProgress: (axiosProgressEvent) => {
        setPostJobNoteFilesProgress({
          value: (axiosProgressEvent?.progress ?? 0) * 100,
          error: false,
        });
      },
    });

  useEffect(() => {
    if (!jobNoteResultDialogState.open) {
      setPostJobNoteProgress({
        value: 0,
        error: false,
      });
      setPostJobNoteFilesProgress({
        value: 0,
        error: false,
      });
      return;
    }

    postJobNoteMutateAsync({
      ...jobNoteResultDialogState.requestData,
      files:
        jobNoteResultDialogState.requestData.type === "RFI"
          ? jobNoteResultDialogState.requestData.files
          : [],
    })
      .then(({ id, jobNoteFolderId, jobNoteNumber }) => {
        onSuccess();
        postJobNoteFilesMutateAsync({
          files: jobNoteResultDialogState.requestData.files,
          jobNoteId: id,
          jobNoteNumber,
          jobNotesFolderId: jobNoteFolderId ?? "",
        })
          .catch((error: AxiosError<FileServerErrorResponseData>) => {
            setPostJobNoteFilesProgress({ value: 100, error: true });

            toast({
              title: error.response?.data.message,
              variant: "destructive",
            });
          })
          .finally(() => {
            queryClient.invalidateQueries({
              queryKey: getJobNotesQueryKey(
                jobNoteResultDialogState.requestData.jobId
              ),
            });
          });
      })
      .catch((error: AxiosError<ErrorResponseData>) => {
        setPostJobNoteProgress({ value: 100, error: true });
        setPostJobNoteFilesProgress({ value: 100, error: true });

        if (
          error.response &&
          error.response.data.errorCode.filter((value) => value != null)
            .length !== 0
        ) {
          toast({
            title: error.response.data.message,
            variant: "destructive",
          });
          return;
        }
      });
  }, [
    onSuccess,
    postJobNoteFilesMutateAsync,
    postJobNoteMutateAsync,
    queryClient,
    jobNoteResultDialogState,
  ]);

  return (
    <Dialog
      {...dialogProps}
      open={jobNoteResultDialogState.open}
      onOpenChange={(newOpen) => {
        if (
          postJobNoteProgress.value !== 100 ||
          postJobNoteFilesProgress.value !== 100
        ) {
          return;
        }

        dialogProps.onOpenChange(newOpen);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {jobNoteResultDialogState.open &&
            (postJobNoteProgress.value !== 100 ||
              postJobNoteFilesProgress.value !== 100)
              ? "Job Note"
              : "Completed!"}
          </DialogTitle>
          <DialogDescription>
            {jobNoteResultDialogState.open &&
            (postJobNoteProgress.value !== 100 ||
              postJobNoteFilesProgress.value !== 100)
              ? " It may take some time for files to appear in Google Drive after uploading."
              : "Both the job note file and mail have been sent successfully!"}
          </DialogDescription>
        </DialogHeader>
        {jobNoteResultDialogState.open &&
          jobNoteResultDialogState.requestData.type === "RFI" && (
            <div className="flex flex-col gap-1">
              <Progress value={postJobNoteProgress.value} />
              <p
                className={cn(
                  "text-xs text-muted-foreground text-center",
                  postJobNoteProgress.error && "text-destructive"
                )}
              >
                {postJobNoteProgress.value !== 100
                  ? "Preparing to send email..."
                  : postJobNoteProgress.error
                  ? "Failed to send email"
                  : !isPostJobNoteMutationSuccess
                  ? "Please wait for the email to be sent... It may take up to 3 minutes"
                  : "Completed to send email"}
              </p>
            </div>
          )}
        <div className="flex flex-col gap-1">
          <Progress value={postJobNoteFilesProgress.value} />
          <p
            className={cn(
              "text-xs text-muted-foreground text-center",
              postJobNoteFilesProgress.error && "text-destructive"
            )}
          >
            {postJobNoteFilesProgress.value !== 100
              ? "Please wait for the file to upload..."
              : postJobNoteFilesProgress.error
              ? "Failed to upload file"
              : "Completed to upload file"}
          </p>
        </div>
        <DialogFooter>
          <Button
            onClick={() => {
              dialogProps.onOpenChange(false);
            }}
            disabled={
              jobNoteResultDialogState.open &&
              (postJobNoteProgress.value !== 100 ||
                postJobNoteFilesProgress.value !== 100)
            }
          >
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
