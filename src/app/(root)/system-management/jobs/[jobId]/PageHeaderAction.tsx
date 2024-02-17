import Link from "next/link";
import { ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JobResponseDto, ProjectResponseDto } from "@/api/api-spec";
import OpenJobFolderButton from "@/components/OpenJobFolderButton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Props {
  job: JobResponseDto;
  project: ProjectResponseDto;
}

export default function PageHeaderAction({ job, project }: Props) {
  return (
    <div className="flex gap-2">
      <OpenJobFolderButton job={job} project={project} />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size={"sm"} variant={"outline"}>
            <ScrollText className="mr-2 h-4 w-4" />
            View Notes
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/system-management/jobs/${job.id}/ahj-notes`}>
              <span>AHJ Notes</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/system-management/jobs/${job.id}/client-notes`}>
              <span>Client Notes</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild disabled={project.utilityId == null}>
            <Link href={`/system-management/jobs/${job.id}/utility-notes`}>
              <span>Utility Notes</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
