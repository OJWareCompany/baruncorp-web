import Link from "next/link";
import { FolderOpen, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectResponseDto } from "@/api";

interface Props {
  project: ProjectResponseDto;
}

export default function PageHeaderAction({ project }: Props) {
  return (
    <div className="flex gap-2">
      <Button asChild size={"sm"} variant={"outline"}>
        <Link href={`/system-management/projects/${project.projectId}/ahj`}>
          <ScrollText className="mr-2 h-4 w-4" />
          <span>View AHJ Note</span>
        </Link>
      </Button>
      {/* TODO */}
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
              // TODO installUrl 교체 필요 and 환경 변수로 빼는 것도 고려
              const installUrl = `http://ojw.synology.me:5000/sharing/amHYctCw5`;
              const newWindow = window.open(installUrl, "_blank");
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
    </div>
  );
}
