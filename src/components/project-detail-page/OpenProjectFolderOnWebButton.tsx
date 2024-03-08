import React from "react";
import { FolderOpen } from "lucide-react";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { ProjectResponseDto } from "@/api/api-spec";

interface Props {
  project: ProjectResponseDto;
}

export default function OpenProjectFolderOnWebButton({ project }: Props) {
  if (project.shareLink == null) {
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
    <a href={project.shareLink} target="_blank" rel="noopener noreferrer">
      <Button size={"sm"} variant={"outline"}>
        <FolderOpen className="mr-2 h-4 w-4" />
        <span>Open Folder on Web</span>
      </Button>
    </a>
  );
}
