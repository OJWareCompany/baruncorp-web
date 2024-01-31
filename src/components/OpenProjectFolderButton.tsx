import React from "react";
import { FolderOpen } from "lucide-react";
import { Button } from "./ui/button";
import { ProjectResponseDto } from "@/api/api-spec";

interface Props {
  project: ProjectResponseDto;
}

export default function OpenProjectFolderButton({ project }: Props) {
  return (
    <Button
      size={"sm"}
      variant={"outline"}
      onClick={() => {
        let openDesktopApp = false;

        window.onblur = () => {
          openDesktopApp = true;
        };

        setTimeout(() => {
          if (!openDesktopApp) {
            window.alert(
              `Couldn't find the app.
      Please go to the app installation page.
      If it doesn't move, please check the pop-up.`
            );
            const newWindow = window.open(
              process.env.NEXT_PUBLIC_INSTALLER_URL,
              "_blank"
            );
            if (newWindow) {
              newWindow.focus();
            }
          }
        }, 2000);

        const url = `barun://open-project?payload=${encodeURIComponent(
          JSON.stringify({
            organization: project.clientOrganization,
            type: project.propertyType,
            project: project.propertyAddress.fullAddress,
            // Hard data
            // organization: "1 Earth Solar",
            // type: "Commercial",
            // project: "103 Church Street-Granville-Illinois-61326",
          })
        )}`;
        window.location.href = url;
      }}
    >
      <FolderOpen className="mr-2 h-4 w-4" />
      <span>Open Folder</span>
    </Button>
  );
}
