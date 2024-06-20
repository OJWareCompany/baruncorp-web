import React from "react";
import { FolderOpen } from "lucide-react";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { JobResponseDto } from "@/api/api-spec";
import { cn } from "@/lib/utils";

interface Props {
  job: JobResponseDto;
  title?: string;
  className?: string;
}

export default function OpenJobFolderOnWebButton({
  job,
  title,
  className,
}: Props) {
  if (job.shareLink == null) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger>
          <Button size={"sm"} variant={"outline"} disabled>
            <FolderOpen className="mr-2 h-4 w-4" />
            <span>Open Folder on Web</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          Some error occurred and the link is missing
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <a href={job.shareLink} target="_blank" rel="noopener noreferrer">
      <Button
        size={"sm"}
        variant={"outline"}
        className={(cn(""), className)}
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <FolderOpen className="h-4 w-4 mr-1" />
        <span>{title}</span>
      </Button>
    </a>
  );
}
