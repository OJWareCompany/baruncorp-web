import Link from "next/link";
import { ScrollText } from "lucide-react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { JobResponseDto, ProjectResponseDto } from "@/api/api-spec";
import OpenJobFolderButton from "@/components/OpenJobFolderButton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function getNotesUrl({
  pageType,
  noteType,
  jobId,
}: {
  pageType: PageType;
  noteType: "ahj-notes" | "client-notes" | "utility-notes";
  jobId: string;
}) {
  switch (pageType) {
    case "HOME":
      return `/jobs/${jobId}/${noteType}`;
    case "WORKSPACE":
      return `/workspace/jobs/${jobId}/${noteType}`;
    case "SYSTEM_MANAGEMENT":
      return `/system-management/jobs/${jobId}/${noteType}`;
  }
}

interface Props {
  job: JobResponseDto;
  project: ProjectResponseDto;
  pageType: PageType;
}

export default function PageHeaderAction({ job, project, pageType }: Props) {
  const { data: session } = useSession();

  return (
    <div className="flex gap-2">
      <OpenJobFolderButton job={job} project={project} />
      {/* 바른코프 멤버이거나 Home이 아니면 보인다. 클라이언트인데, Home이라면 안 보인다. */}
      {((session && session.isBarunCorpMember) || pageType !== "HOME") && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size={"sm"} variant={"outline"}>
              <ScrollText className="mr-2 h-4 w-4" />
              View Notes
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link
                href={getNotesUrl({
                  jobId: job.id,
                  pageType,
                  noteType: "ahj-notes",
                })}
              >
                <span>AHJ Notes</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href={getNotesUrl({
                  jobId: job.id,
                  pageType,
                  noteType: "client-notes",
                })}
              >
                <span>Client Notes</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild disabled={project.utilityId == null}>
              <Link
                href={getNotesUrl({
                  jobId: job.id,
                  pageType,
                  noteType: "utility-notes",
                })}
              >
                <span>Utility Notes</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
