import React from "react";
import { FolderOpen } from "lucide-react";
import { Button } from "../ui/button";
import { ProjectResponseDto } from "@/api/api-spec";
import { openProjectFolder } from "@/lib/deeplink";

interface Props {
  project: ProjectResponseDto;
}

export default function OpenProjectFolderOnDesktopButton({ project }: Props) {
  return (
    <Button
      size={"sm"}
      variant={"outline"}
      onClick={() => {
        openProjectFolder({
          organization: project.clientOrganization,
          type: project.propertyType,
          project: project.propertyAddress.fullAddress,
          folderId: project.projectFolderId,
          shareLink: project.shareLink,
          parentlessFolder: project.parentlessFolder ?? false,
          sharedDriveVersion: project.sharedDriveVersion ?? "001",
        });
      }}
    >
      <FolderOpen className="mr-2 h-4 w-4" />
      <span>Open Folder on Desktop</span>
    </Button>
  );
}
