"use client";
import { DialogProps } from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import { DialogState } from "./JobNoteForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/components/ui/use-toast";
import usePostJobNoteMutation from "@/mutations/usePostJobNoteMutation";
import usePostJobNoteFilesMutation from "@/mutations/usePostJobNoteFilesMutation";

interface Props extends DialogProps {
  onOpenChange: (open: boolean) => void;
  state: DialogState;
}

export default function JobNoteResultDialog({ state, ...dialogProps }: Props) {
  const [postJobNoteProgress, setPostJobNoteProgress] = useState({
    value: 0,
    error: false,
  });
  const [uploadJobNoteFilesProgress, setUploadJobNoteFilesProgress] = useState({
    value: 0,
    error: false,
  });
  const { mutateAsync: postJobNoteMutateAsync } = usePostJobNoteMutation({
    onUploadProgress: (axiosProgressEvent) => {
      console.log("🚀 ~ JobNoteResultDialog ~ api server:", axiosProgressEvent);
      setPostJobNoteProgress({
        value: (axiosProgressEvent?.progress ?? 0) * 100,
        error: false,
      });
    },
  });
  const { mutateAsync: postJobNoteFilesMutateAsync } =
    usePostJobNoteFilesMutation({
      onUploadProgress: (axiosProgressEvent) => {
        console.log(
          "🚀 ~ JobNoteResultDialog ~ file server:",
          axiosProgressEvent
        );
        setUploadJobNoteFilesProgress({
          value: (axiosProgressEvent?.progress ?? 0) * 100,
          error: false,
        });
      },
    });

  useEffect(() => {
    if (!state.open) {
      return;
    }

    postJobNoteMutateAsync(state.requestData)
      .then(({ id, jobNoteFolderId, jobNoteNumber }) => {
        postJobNoteFilesMutateAsync({
          files: state.requestData.files,
          jobNoteId: id,
          jobNoteNumber,
          jobNotesFolderId: jobNoteFolderId ?? "",
        }).catch((error: AxiosError<FileServerErrorResponseData>) => {
          console.log("file server error:", error);
          // if (
          //   error.response &&
          //   error.response.data.errorCode.filter((value) => value != null)
          //     .length !== 0
          // ) {
          //   toast({
          //     title: error.response.data.message,
          //     variant: "destructive",
          //   });
          //   return;
          // }
        });
      })
      .catch((error: AxiosError<ErrorResponseData>) => {
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
    // if (state.requestData.type === "RFI") {
    // }

    // mutateAsync({
    //   files,
    //   jobNoteId,
    //   jobNoteNumber,
    //   jobNotesFolderId,
    // }).catch(() => {
    //   toast({
    //     title: "Upload failed",
    //     description: errorToastDescription,
    //     variant: "destructive",
    //   });
    // });
  }, [postJobNoteFilesMutateAsync, postJobNoteMutateAsync, state]);

  return (
    <Dialog
      {...dialogProps}
      onOpenChange={(newOpen) => {
        // TODO
        // if (files.length !== 0 && postJobNoteProgress.value !== 100) {
        //   return;
        // }

        dialogProps.onOpenChange(newOpen);
      }}
      open={state.open}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Todo</DialogTitle>
          {/* <DialogDescription>
            You can place more orders or go to the details page for your order
            details.
          </DialogDescription> */}
        </DialogHeader>
        <div className="flex flex-col gap-1">
          <Progress value={uploadJobNoteFilesProgress.value} />
          <p
            className={cn(
              "text-xs text-muted-foreground text-center",
              uploadJobNoteFilesProgress.error && "text-destructive"
            )}
          >
            {uploadJobNoteFilesProgress.value !== 100
              ? "Please wait for upload..."
              : uploadJobNoteFilesProgress.error
              ? "Upload failed"
              : "Upload completed"}
          </p>
        </div>
        <div className="flex flex-col gap-1">
          <Progress value={uploadJobNoteFilesProgress.value} />
          <p
            className={cn(
              "text-xs text-muted-foreground text-center",
              uploadJobNoteFilesProgress.error && "text-destructive"
            )}
          >
            {uploadJobNoteFilesProgress.value !== 100
              ? "Please wait for upload..."
              : uploadJobNoteFilesProgress.error
              ? "Upload failed"
              : "Upload completed"}
          </p>
        </div>
        {/* {files.length !== 0 && (
        )} */}
        {/* <DialogFooter>
          <Button
            variant={"outline"}
            onClick={() => {
              dialogProps.onOpenChange(false);
            }}
            disabled={files.length !== 0 && postJobNoteProgress.value !== 100}
          >
            Order More
          </Button>
          <Button
            onClick={() => {
              if (jobId == null) {
                return;
              }

            }}
            disabled={files.length !== 0 && postJobNoteProgress.value !== 100}
          >
            View Detail
          </Button>
        </DialogFooter> */}
      </DialogContent>
    </Dialog>
  );
}
