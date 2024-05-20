"use client";
import { Plus } from "lucide-react";
import { useState } from "react";
import NewScopeForm from "./NewScopeForm";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { JobResponseDto } from "@/api/api-spec";

interface Props {
  job: JobResponseDto;
}

export default function NewScopeSheet({ job }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant={"outline"}
          size={"sm"}
          className="h-[28px] text-xs px-2"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Scope
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-[1400px] w-full">
        <SheetHeader className="mb-6">
          <SheetTitle>New Scope</SheetTitle>
        </SheetHeader>
        <NewScopeForm
          job={job}
          onSuccessWithoutWetStamp={() => {
            setOpen(false);
          }}
          onSuccess={() => {
            setOpen(false);
          }}
        />
      </SheetContent>
    </Sheet>
  );
}
