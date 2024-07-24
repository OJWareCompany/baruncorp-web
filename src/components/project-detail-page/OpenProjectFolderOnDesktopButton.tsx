import React from "react";
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
      className="border-none w-full justify-start"
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
      <span className="ml-1">Desktop</span>
    </Button>
  );
}
