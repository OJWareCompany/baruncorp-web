import Link from "next/link";
import { ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JobResponseDto, ProjectResponseDto } from "@/api/api-spec";
import OpenJobFolderButton from "@/components/job-detail-page/OpenJobFolderButton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProfileContext } from "@/app/(root)/ProfileProvider";

function getNotesUrl({
  pageType,
  noteType,
  jobId,
}: {
  pageType: JobDetailPageType;
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
  pageType: JobDetailPageType;
}

export default function PageHeaderAction({ job, project, pageType }: Props) {
  const { isBarunCorpMember } = useProfileContext();
  const isHome = pageType === "HOME";

  /**
   * 바른코프 멤버 ✅
   * 바른코프 멤버아닌데, 홈 ❌
   * 바른코프 멤버아닌데, 워크스페이스 ✅
   */
  const isWorker = isBarunCorpMember || !isHome;

  if (isWorker) {
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
      </div>
    );
  }
}
