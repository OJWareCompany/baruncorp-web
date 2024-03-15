import React from "react";
import { FolderOpen } from "lucide-react";
import { Button } from "../ui/button";
import { JobResponseDto, ProjectResponseDto } from "@/api/api-spec";
import { openJobFolder } from "@/lib/deeplink";

interface Props {
  job: JobResponseDto;
  project: ProjectResponseDto;
}

export default function OpenJobFolderOnDesktopButton({ job, project }: Props) {
  return (
    <Button
      size={"sm"}
      variant={"outline"}
      onClick={() => {
        openJobFolder({
          organization: job.clientInfo.clientOrganizationName,
          type: project.propertyType,
          project: job.propertyFullAddress,
          job: `Job ${job.jobRequestNumber}`,
          folderId: job.jobFolderId,
          shareLink: job.shareLink,
        });
      }}
    >
      <FolderOpen className="mr-2 h-4 w-4" />
      <span>Open Folder on Desktop</span>
    </Button>
  );
}