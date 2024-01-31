import React from "react";
import { FolderOpen } from "lucide-react";
import { Button } from "./ui/button";
import { AhjNoteResponseDto } from "@/api/api-spec";

interface Props {
  ahjNote: AhjNoteResponseDto;
  className?: string;
}

export default function OpenAhjFolderButton({ className, ahjNote }: Props) {
  return (
    <Button size={"sm"} variant={"outline"} className={className}>
      <FolderOpen className="mr-2 h-4 w-4" />
      <span>Open {ahjNote.general.fullAhjName} Folder</span>
    </Button>
  );
}
