import Link from "next/link";
import { ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectResponseDto } from "@/api";
import OpenProjectFolderButton from "@/components/OpenProjectFolderButton";

interface Props {
  project: ProjectResponseDto;
}

export default function PageHeaderAction({ project }: Props) {
  return (
    <div className="flex gap-2">
      <Button asChild size={"sm"} variant={"outline"}>
        <Link href={`/workspace/projects/${project.projectId}/ahj`}>
          <ScrollText className="mr-2 h-4 w-4" />
          <span>View AHJ Note</span>
        </Link>
      </Button>
      <OpenProjectFolderButton project={project} />
    </div>
  );
}
