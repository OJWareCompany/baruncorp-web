"use client";
import { useState } from "react";
import { Pen } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import AhjNotesTypeTable, {
  AhjNoteType,
} from "@/app/(root)/system-management/ahj-notes/AhjNotesTypeTable";
import { ProjectAssociatedRegulatoryBody } from "@/lib/ahj";

type Props = {
  projectId: string;
  originProjectAssociatedRegulatoryBody: ProjectAssociatedRegulatoryBody;
  typeName: string;
};

export default function AhjNoteChangeSheet({
  projectId,
  originProjectAssociatedRegulatoryBody,
  typeName,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size={"sm"} variant={"outline"} className="w-auto mb-2">
          <Pen className="mr-2 h-4 w-4" />
          <span>{`Change ${typeName} Note`}</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-[1400px] w-full">
        <SheetHeader className="mb-6">
          <SheetTitle>{`Choose a ${typeName} Note`}</SheetTitle>
        </SheetHeader>
        <AhjNotesTypeTable
          projectId={projectId}
          originProjectAssociatedRegulatoryBody={
            originProjectAssociatedRegulatoryBody
          }
          type={typeName.toUpperCase() as AhjNoteType}
          closeTableSheet={() => {
            setOpen(false);
          }}
        />
      </SheetContent>
    </Sheet>
  );
}
