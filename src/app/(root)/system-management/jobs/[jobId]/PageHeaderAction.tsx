import Link from "next/link";
import { ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JobResponseDto, ProjectResponseDto } from "@/api";
import OpenJobFolderButton from "@/components/OpenJobFolderButton";

interface Props {
  job: JobResponseDto;
  project: ProjectResponseDto;
}

export default function PageHeaderAction({ job, project }: Props) {
  return (
    <div className="flex gap-2">
      <Button asChild size={"sm"} variant={"outline"}>
        <Link href={`/system-management/jobs/${job.id}/ahj`}>
          <ScrollText className="mr-2 h-4 w-4" />
          <span>View AHJ Note</span>
        </Link>
      </Button>
      <OpenJobFolderButton job={job} project={project} />
    </div>
  );
}
