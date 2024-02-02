"use client";
import { DialogProps } from "@radix-ui/react-dialog";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useNewServiceOrderData } from "./NewServiceOrderDataProvider";
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
import useUploadJobFilesMutation from "@/mutations/useUploadJobFilesMutation";
import { toast } from "@/components/ui/use-toast";

interface Props extends DialogProps {
  onOpenChange: (open: boolean) => void;
  files: File[];
  jobId?: string;
}

export default function ResultDialog({ files, jobId, ...dialogProps }: Props) {
  const { isBarunCorpMember } = useNewServiceOrderData();
  const router = useRouter();
  const { data: job } = useJobQuery(jobId ?? "");

  const {
    mutationResult: { mutateAsync },
    progressState,
  } = useUploadJobFilesMutation();

  useEffect(() => {
    if (!dialogProps.open) return;
    if (files.length === 0) return;
    if (!job || !job?.jobFolderId) return;

    mutateAsync({
      files: files,
      jobFolderId: job.jobFolderId,
    }).catch(() => {
      toast({
        title: "Upload failed",
        description: errorToastDescription,
        variant: "destructive",
      });
    });
  }, [dialogProps.open, files, job, toast]);

  return (
    <Dialog
      {...dialogProps}
      onOpenChange={(newOpen) => {
        if (files.length !== 0 && progressState.value !== 100) {
          return;
        }

        dialogProps.onOpenChange(newOpen);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Order Completed</DialogTitle>
          <DialogDescription>
            You can place more orders or go to the details page for your order
            details.
          </DialogDescription>
        </DialogHeader>
        {files.length !== 0 && (
          <div className="flex flex-col gap-1">
            <Progress value={progressState.value} />
            <p
              className={cn(
                "text-xs text-muted-foreground text-center",
                progressState.error && "text-destructive"
              )}
            >
              {progressState.value !== 100
                ? "Please wait for upload..."
                : progressState.error
                ? "Upload failed"
                : "Upload completed"}
            </p>
          </div>
        )}
        <DialogFooter>
          <Button
            variant={"outline"}
            onClick={() => {
              dialogProps.onOpenChange(false);
            }}
            disabled={files.length !== 0 && progressState.value !== 100}
          >
            Order More
          </Button>
          <Button
            onClick={() => {
              if (jobId == null) {
                return;
              }

              if (isBarunCorpMember) {
                router.push(`/system-management/jobs/${jobId}`);
                return;
              }

              router.push(`/jobs/${jobId}`);
            }}
            disabled={files.length !== 0 && progressState.value !== 100}
          >
            View Detail
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
