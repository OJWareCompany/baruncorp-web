"use client";
import { DialogProps } from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { DialogState } from "./JobNoteForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  state: DialogState;
  onSuccess: () => void;
}

export default function JobNoteResultDialog({
  state,
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
  const { mutateAsync: postJobNoteMutateAsync } = usePostJobNoteMutation({
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
    if (!state.open) {
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
      ...state.requestData,
      files: state.requestData.type === "RFI" ? state.requestData.files : [],
    })
      .then(({ id, jobNoteFolderId, jobNoteNumber }) => {
        onSuccess();
        postJobNoteFilesMutateAsync({
          files: state.requestData.files,
          jobNoteId: id,
          jobNoteNumber,
          jobNotesFolderId: jobNoteFolderId ?? "",
        })
          .catch((error: AxiosError<FileServerErrorResponseData>) => {
            toast({
              title: error.message,
              variant: "destructive",
            });
          })
          .finally(() => {
            queryClient.invalidateQueries({
              queryKey: getJobNotesQueryKey(state.requestData.jobId),
            });
          });
      })
      .catch((error: AxiosError<ErrorResponseData>) => {
        setPostJobNoteProgress({ value: 100, error: true });
        setPostJobNoteFilesProgress({ value: 100, error: true });

        switch (error.request.status) {
          case 0:
            toast({
              title:
                "When sending mail, the maximum file size is currently set to 1 MB, but we plan to modify this to allow up to 10 files with a maximum size of 25 MB.",
              variant: "destructive",
            });
            return;
        }

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
    state,
  ]);

  return (
    <Dialog
      {...dialogProps}
      onOpenChange={(newOpen) => {
        if (
          postJobNoteProgress.value !== 100 ||
          postJobNoteFilesProgress.value !== 100
        ) {
          return;
        }

        dialogProps.onOpenChange(newOpen);
      }}
      open={state.open}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Job Note</DialogTitle>
          <DialogDescription>
            It may take some time for files to appear in Google Drive after
            uploading.
          </DialogDescription>
        </DialogHeader>
        {state.open && state.requestData.type === "RFI" && (
          <div className="flex flex-col gap-1">
            <Progress value={postJobNoteProgress.value} />
            <p
              className={cn(
                "text-xs text-muted-foreground text-center",
                postJobNoteProgress.error && "text-destructive"
              )}
            >
              {postJobNoteProgress.value !== 100
                ? "Please wait for the email to be sent..."
                : postJobNoteProgress.error
                ? "Failed to send email"
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
      </DialogContent>
    </Dialog>
  );
}
