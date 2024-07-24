import Link from "next/link";
import { FolderOpen, ScrollText } from "lucide-react";
import OpenJobFolderOnWebButton from "./OpenJobFolderOnWebButton";
import OpenDeliverablesFolderOnWebButton from "./OpenDeliverablesFolderOnWebButton";
import { Button } from "@/components/ui/button";
import { JobResponseDto, ProjectResponseDto } from "@/api/api-spec";
import OpenJobFolderOnDesktopButton from "@/components/job-detail-page/OpenJobFolderOnDesktopButton";
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
  const { isBarunCorpMember, isClientCompanyMember } = useProfileContext();
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size={"sm"} variant={"outline"}>
              <FolderOpen className="mr-2 h-4 w-4" />
              Open Job Folder
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem asChild>
              <OpenJobFolderOnWebButton
                job={job}
                title="Web"
                className="border-none w-full justify-start pl-4"
              />
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <OpenJobFolderOnDesktopButton job={job} project={project} />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {/* Worker + ClientCompanyMember ✅ */}
        {isClientCompanyMember && (
          <OpenDeliverablesFolderOnWebButton job={job} />
        )}
        {/* <OpenDeliverablesFolderOnWebButton job={job} /> */}
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

  if (isClientCompanyMember) {
    return (
      <div className="flex gap-2">
        <OpenDeliverablesFolderOnWebButton job={job} />
      </div>
    );
  }
}
