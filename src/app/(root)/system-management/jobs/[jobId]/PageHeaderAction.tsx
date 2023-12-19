import Link from "next/link";
import { FolderOpen, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JobResponseDto } from "@/api";

interface Props {
  job: JobResponseDto;
}

export default function PageHeaderAction({ job }: Props) {
  return (
    <div className="flex gap-2">
      <Button asChild size={"sm"} variant={"outline"}>
        <Link href={`/system-management/jobs/${job.id}/ahj`}>
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

          const url = `barun://open-job?payload=${encodeURIComponent(
            JSON.stringify({
              organization: job.clientInfo.clientOrganizationName,
              type: job.propertyType,
              project: job.propertyFullAddress,
              job: job.jobName,
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
    </div>
  );
}
