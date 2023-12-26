"use client";
import { DialogProps } from "@radix-ui/react-dialog";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
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
import { useToast } from "@/components/ui/use-toast";
import useJobQuery from "@/queries/useJobQuery";
import { errorToastDescription } from "@/lib/constants";

interface Props extends DialogProps {
  onOpenChange: (open: boolean) => void;
  files: File[];
  jobId?: string;
}

export default function ResultDialog({ files, jobId, ...dialogProps }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [progressState, setProgressState] = useState({
    value: 0,
    error: false,
  });
  const { data: job } = useJobQuery(jobId ?? "");

  useEffect(() => {
    if (dialogProps.open && job) {
      const {
        clientInfo: { clientOrganizationName },
        projectPropertyType,
        propertyFullAddress,
        jobRequestNumber,
      } = job;

      if (files.length !== 0) {
        const url = `${
          process.env.NEXT_PUBLIC_FILE_API_URL
        }/filesystem/${encodeURIComponent(
          clientOrganizationName
        )}/${projectPropertyType}/${encodeURIComponent(
          propertyFullAddress
        )}/${encodeURIComponent(`Job ${jobRequestNumber}`)}/files-hack`;

        const formData = new FormData();
        for (const file of files) {
          formData.append("files", file);
        }

        axios
          .post(url, formData, {
            onUploadProgress: (axiosProgressEvent) => {
              setProgressState({
                value: (axiosProgressEvent?.progress ?? 0) * 100,
                error: false,
              });
            },
          })
          .then(console.log)
          .catch(() => {
            toast({
              title: "Upload failed",
              description: errorToastDescription,
              variant: "destructive",
            });
            setProgressState({ value: 100, error: true });
          });
      } else {
        /**
         * @TODO 삭제 예정
         * 파일 서버 - 잡 폴더 생성 API 연동
         * 이 API는 추후 바른 서버 백엔드에서 재연동 되어야 한다
         */
        const url = `${
          process.env.NEXT_PUBLIC_FILE_API_URL
        }/filesystem/${encodeURIComponent(
          clientOrganizationName
        )}/${projectPropertyType}/${encodeURIComponent(
          propertyFullAddress
        )}/${encodeURIComponent(`Job ${jobRequestNumber}`)}`;

        axios.post(url).then(console.log).catch(console.error);
      }
    } else {
      setProgressState({ value: 0, error: false });
    }
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

              router.push(`/system-management/jobs/${jobId}`);
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
