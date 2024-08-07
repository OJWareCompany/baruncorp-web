import Link from "next/link";
import { FolderOpen, ScrollText } from "lucide-react";
import OpenProjectFolderOnDesktopButton from "./OpenProjectFolderOnDesktopButton";
import OpenProjectFolderOnWebButton from "./OpenProjectFolderOnWebButton";
import { Button } from "@/components/ui/button";
import { ProjectResponseDto } from "@/api/api-spec";
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
  projectId,
}: {
  pageType: JobDetailPageType;
  noteType: "ahj-notes" | "client-notes" | "utility-notes";
  projectId: string;
}) {
  switch (pageType) {
    case "HOME":
      return `/projects/${projectId}/${noteType}`;
    case "WORKSPACE":
      return `/workspace/projects/${projectId}/${noteType}`;
    case "SYSTEM_MANAGEMENT":
      return `/system-management/projects/${projectId}/${noteType}`;
  }
}

interface Props {
  project: ProjectResponseDto;
  pageType: JobDetailPageType;
}

export default function PageHeaderAction({ project, pageType }: Props) {
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size={"sm"} variant={"outline"}>
              <FolderOpen className="mr-2 h-4 w-4" />
              Open Project Folder
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem asChild>
              <OpenProjectFolderOnWebButton project={project} />
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <OpenProjectFolderOnDesktopButton project={project} />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
                  projectId: project.projectId,
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
                  projectId: project.projectId,
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
                  projectId: project.projectId,
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
