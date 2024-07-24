import React from "react";
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
      className="border-none w-full justify-start"
      onClick={() => {
        openJobFolder({
          organization: job.clientInfo.clientOrganizationName,
          type: project.propertyType,
          project: job.propertyFullAddress,
          job: `Job ${job.jobRequestNumber}`,
          folderId: job.jobFolderId,
          shareLink: job.shareLink,
          parentlessFolder: job.parentlessFolder ?? false,
          sharedDriveVersion: job.sharedDriveVersion ?? "001",
        });
      }}
    >
      <span className="ml-1">Desktop</span>
    </Button>
  );
}
