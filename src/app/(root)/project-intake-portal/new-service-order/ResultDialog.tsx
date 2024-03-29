"use client";
import { DialogProps } from "@radix-ui/react-dialog";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Socket, io } from "socket.io-client";
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
  const router = useRouter();
  const { data: job } = useJobQuery(state.open ? state.jobId : "");

  const [postJobFilesProgress, setPostJobFilesProgress] = useState({
    value: 0,
    error: false,
  });

  const { mutateAsync: postJobFilesMutateAsync } = usePostJobFilesMutation({
    onUploadProgress: (axiosProgressEvent) => {
      setPostJobFilesProgress({
        value: (axiosProgressEvent?.progress ?? 0) * 100,
        error: false,
      });
    },
  });

  const socketRef = useRef<Socket>();
  const [myOrder, setMyOrder] = useState<number | null>(null);
  const [activeFileUpload, setActiveFileUpload] = useState(false);

  const myOrderListener = ({ myOrder }: { myOrder: number }) => {
    setMyOrder(myOrder);
  };

  const activeFileUploadListener = async ({
    fileUploadId,
  }: {
    fileUploadId: string;
  }) => {
    if (
      !state.open ||
      state.files.length === 0 ||
      job == null ||
      job.jobFolderId == null
    ) {
      return;
    }

    setActiveFileUpload(true);

    socketRef.current?.off("my-order", myOrderListener);
    socketRef.current?.off("active-file-upload", activeFileUploadListener);

    await postJobFilesMutateAsync({
      fileUploadId,
      files: state.files,
      jobFolderId: job.jobFolderId,
    }).catch(() => {
      toast({
        title: "Upload failed",
        description: errorToastDescription,
        variant: "destructive",
      });
    });

    socketRef.current?.disconnect();
    socketRef.current = undefined;
  };

  useEffect(() => {
    if (
      !state.open ||
      state.files.length === 0 ||
      job == null ||
      job.jobFolderId == null
    ) {
      setPostJobFilesProgress({
        value: 0,
        error: false,
      });
      return;
    }

    if (socketRef.current) {
      return;
    }

    socketRef.current = io(
      `${process.env.NEXT_PUBLIC_FILE_API_URL}?room=file-upload`,
      {
        autoConnect: false,
      }
    );

    socketRef.current.connect();
    socketRef.current.on("my-order", myOrderListener);
    socketRef.current.on("active-file-upload", activeFileUploadListener);
  }, [job, postJobFilesMutateAsync, state]);

  useEffect(() => {
    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

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
        <DialogHeader className="flex flex-direction">
          {activeFileUpload ? (
            postJobFilesProgress.value === 100 ? (
              <DialogTitle>Order Completed</DialogTitle>
            ) : (
              <DialogTitle>Uploading...</DialogTitle>
            )
          ) : (
            <DialogTitle>
              My Waiting Order : {myOrder ?? "Getting my-order"}{" "}
            </DialogTitle>
          )}
          <DialogDescription>
            {activeFileUpload
              ? state.open && state.files.length !== 0
                ? "It may take some time for files to appear in Google Drive after uploading."
                : "You can place more orders or go to the details page for your order details."
              : "Waiting for the order to be placed. Once the order is complete, file upload will begin."}
          </DialogDescription>
        </DialogHeader>
        {state.open && state.files.length !== 0 && (
          <div className="flex flex-col gap-1">
            {activeFileUpload ? (
              <Progress value={postJobFilesProgress.value} />
            ) : null}
            <span
              className={cn(
                "text-sm text-muted-foreground text-center",
                postJobFilesProgress.error && "text-destructive"
              )}
            >
              {activeFileUpload
                ? postJobFilesProgress.value !== 100
                  ? "Please wait for the file to upload..."
                  : postJobFilesProgress.error
                  ? "Failed to upload file"
                  : "Completed to upload file"
                : "Please wait for your order to arrive..."}
            </span>
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
