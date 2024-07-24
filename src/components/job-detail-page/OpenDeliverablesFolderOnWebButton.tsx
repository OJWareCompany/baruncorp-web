import React from "react";
import { FolderOpen } from "lucide-react";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { JobResponseDto } from "@/api/api-spec";

interface Props {
  job: JobResponseDto;
  title?: string;
  className?: string;
}

export default function OpenDeliverablesFolderOnWebButton({ job }: Props) {
  if (job.deliverablesFolderShareLink == null) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger>
          <Button size={"sm"} variant={"outline"} disabled>
            <FolderOpen className="mr-2 h-4 w-4" />
            <span>Open Deliverables Folder</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          Some error occurred and the link is missing
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <a
      href={job.deliverablesFolderShareLink}
      target="_blank"
      rel="noopener noreferrer"
    >
      <Button
        size={"sm"}
        variant={"outline"}
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <FolderOpen className="mr-2 h-4 w-4" />
        <span>Open Deliverables Folder</span>
      </Button>
    </a>
  );
}
