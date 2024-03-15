"use client";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import NewScopeForm from "./NewScopeForm";
import UpdateWetStampInfoForm from "./UpdateWetStampInfoForm";
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
  const [isSecondStep, setIsSecondStep] = useState(false);

  useEffect(() => {
    if (!open && isSecondStep) {
      setIsSecondStep(false);
    }
  }, [isSecondStep, open]);

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
          <SheetTitle>
            {!isSecondStep ? "New Scope" : "Update Information"}
          </SheetTitle>
        </SheetHeader>
        {!isSecondStep ? (
          <NewScopeForm
            job={job}
            onSuccessWithWetStamp={() => {
              setIsSecondStep(true);
            }}
            onSuccessWithoutWetStamp={() => {
              setOpen(false);
            }}
          />
        ) : (
          <UpdateWetStampInfoForm
            job={job}
            onSuccess={() => {
              setOpen(false);
            }}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}