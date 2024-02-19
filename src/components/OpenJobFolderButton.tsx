import React from "react";
import { FolderOpen } from "lucide-react";
import { Button } from "./ui/button";
import { JobResponseDto, ProjectResponseDto } from "@/api/api-spec";
import { openJobFolder } from "@/lib/deeplink";

interface Props {
  job: JobResponseDto;
  project: ProjectResponseDto;
}

export default function OpenJobFolderButton({ job, project }: Props) {
  // TODO: 일반 client가 눌렀을 때는 구글 드라이브 웹으로 이동시켜야 한다.

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
      <span>Open Folder</span>
    </Button>
  );
}
