"use client";
import { DialogProps } from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import useJobQuery from "@/queries/useJobQuery";

interface Props extends DialogProps {
  onOpenChange: (open: boolean) => void;
  files: File[];
  jobId?: string;
}

export default function ResultDialog({ files, jobId, ...dialogProps }: Props) {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const { data: job } = useJobQuery({ jobId: jobId ?? "" });

  useEffect(() => {
    if (dialogProps.open && job && files.length !== 0) {
      const {
        clientInfo: { clientOrganizationName },
        jobName,
        propertyFullAddress,
      } = job;

      const url = `/filesystem/${encodeURIComponent(
        clientOrganizationName
      )}/${encodeURIComponent(propertyFullAddress)}/${encodeURIComponent(
        jobName
      )}/files`;

      const formData = new FormData();
      for (const file of files) {
        formData.append("files", file);
      }

      axios.post(url, formData, {
        baseURL: process.env.NEXT_PUBLIC_NAS_API_URL,
        onUploadProgress: (axiosProgressEvent) => {
          setProgress((axiosProgressEvent?.progress ?? 0) * 100);
        },
      });
    } else {
      setProgress(0);
    }
  }, [dialogProps.open, files, job]);

  return (
    <Dialog
      {...dialogProps}
      onOpenChange={(newOpen) => {
        if (files.length !== 0 && progress !== 100) {
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
            <Progress value={progress} />
            <p className="text-xs text-muted-foreground text-center">
              {progress !== 100
                ? "Please wait for upload..."
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
            disabled={files.length !== 0 && progress !== 100}
          >
            Order More
          </Button>
          <Button
            onClick={() => {
              if (jobId == null) {
                return;
              }

              router.push(`/system-management/jobs/${jobId}`);
            }}
            disabled={files.length !== 0 && progress !== 100}
          >
            View Detail
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
