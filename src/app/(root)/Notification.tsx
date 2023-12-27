"use client";
import { Bell, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useSocketContext } from "./SocketProvider";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function Notification() {
  const socket = useSocketContext();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (socket == null) {
      return;
    }

    socket.on("task-assigned", () => {
      setOpen(true);
    });
  }, [socket]);

  return (
    <Popover modal open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size={"icon"}>
          <Bell className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[400px] data-[state=closed]:fade-out-100 data-[state=closed]:zoom-out-100 data-[state=open]:fade-in-100 data-[state=open]:zoom-in-100 p-0"
        align="end"
        side="top"
      >
        <div className="p-3 flex gap-2 items-center">
          <div className="flex-1">
            <p className="text-sm font-medium">
              PV Design task has been assigned
            </p>
            <span className="text-xs text-muted-foreground">
              10-31-2023, 3:11 PM
            </span>
          </div>
          <Button variant="ghost" size={"icon"}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
