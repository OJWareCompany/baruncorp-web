import React from "react";
import { FolderOpen } from "lucide-react";
import { Button } from "./ui/button";
import { AhjNoteResponseDto } from "@/api/api-spec";
import { openAhjFolder } from "@/lib/deeplink";

interface Props {
  ahjNote: AhjNoteResponseDto;
  geoId: string;
  className?: string;
}

export default function OpenAhjFolderButton({
  className,
  ahjNote,
  geoId,
}: Props) {
  return (
    <Button
      size={"sm"}
      variant={"outline"}
      className={className}
      onClick={() => {
        openAhjFolder({
          geoId,
          fullAhjName: ahjNote.general.fullAhjName,
        });
      }}
    >
      <FolderOpen className="mr-2 h-4 w-4" />
      <span>Open {ahjNote.general.fullAhjName} Folder</span>
    </Button>
  );
}
