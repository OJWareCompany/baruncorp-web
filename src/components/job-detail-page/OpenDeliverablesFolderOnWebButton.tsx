import React from "react";
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
          <Button
            variant={"outline"}
            disabled
            // className="border-none w-full justify-start pl-4"
          >
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
        variant={"outline"}
        // className="border-none w-full justify-start pl-4"
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <span>Open Deliverables Folder</span>
      </Button>
    </a>
  );
}
