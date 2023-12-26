"use client";
import { Plus } from "lucide-react";
import { useState } from "react";
import ServiceForm from "./ServiceForm";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useToast } from "@/components/ui/use-toast";

export default function NewServiceSheet() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant={"outline"} size={"sm"}>
          <Plus className="mr-2 h-4 w-4" />
          New Service
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-[1400px] w-full">
        <SheetHeader className="mb-6">
          <SheetTitle>New Service</SheetTitle>
        </SheetHeader>
        <ServiceForm
          onSuccess={() => {
            setOpen(false);
            toast({
              title: "Success",
            });
          }}
        />
      </SheetContent>
    </Sheet>
  );
}
