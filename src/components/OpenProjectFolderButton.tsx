import React from "react";
import { FolderOpen } from "lucide-react";
import { Button } from "./ui/button";
import { ProjectResponseDto } from "@/api/api-spec";
import { openProjectFolder } from "@/lib/deeplink";

interface Props {
  project: ProjectResponseDto;
}

export default function OpenProjectFolderButton({ project }: Props) {
  return (
    <Button
      size={"sm"}
      variant={"outline"}
      onClick={() => {
        openProjectFolder({
          organization: project.clientOrganization,
          type: project.propertyType,
          project: project.propertyAddress.fullAddress,
        });
      }}
    >
      <FolderOpen className="mr-2 h-4 w-4" />
      <span>Open Folder</span>
    </Button>
  );
}
