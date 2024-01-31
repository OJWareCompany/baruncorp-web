import Link from "next/link";
import { ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectResponseDto } from "@/api/api-spec";
import OpenProjectFolderButton from "@/components/OpenProjectFolderButton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Props {
  project: ProjectResponseDto;
}

export default function PageHeaderAction({ project }: Props) {
  return (
    <div className="flex gap-2">
      <OpenProjectFolderButton project={project} />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size={"sm"} variant={"outline"}>
            <ScrollText className="mr-2 h-4 w-4" />
            View Notes
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/workspace/projects/${project.projectId}/ahj-notes`}>
              <span>AHJ Notes</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              href={`/workspace/projects/${project.projectId}/client-notes`}
            >
              <span>Client Notes</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild disabled>
            <Link href="#">
              <span>Utility Notes</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
