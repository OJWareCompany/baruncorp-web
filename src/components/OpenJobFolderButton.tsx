import React from "react";
import { FolderOpen } from "lucide-react";
import { Button } from "./ui/button";
import { JobResponseDto, ProjectResponseDto } from "@/api";

interface Props {
  job: JobResponseDto;
  project: ProjectResponseDto;
}

export default function OpenJobFolderButton({ job, project }: Props) {
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

        if (!project) return;

        const url = `barun://open-job?payload=${encodeURIComponent(
          JSON.stringify({
            organization: job.clientInfo.clientOrganizationName,
            type: project.propertyType,
            project: job.propertyFullAddress,
            job: `Job ${job.jobRequestNumber}`,
            // Hard data
            // organization: "1 Earth Solar",
            // type: "Commercial",
            // project: "103 Church Street-Granville-Illinois-61326",
            // job: "Job 1",
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
