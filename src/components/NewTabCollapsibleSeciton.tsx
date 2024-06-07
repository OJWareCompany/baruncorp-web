"use client";
import { ChevronDown, Info } from "lucide-react";
import { ReactNode, useState } from "react";
import { cn } from "@/lib/utils";
import NewTabToggle from "@/app/(root)/NewTabToggle";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Props {
  title: string;
  children: ReactNode;
  action?: ReactNode;
  isInitiallyCollapsed?: boolean;
}

export default function NewTabCollapsibleSection({
  title,
  children,
  action,
  isInitiallyCollapsed,
}: Props) {
  const [isCollapsed, setIsCollapsed] = useState(isInitiallyCollapsed);
  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between">
        <div
          className="inline-flex items-center cursor-pointer gap-1"
          onClick={(event) => {
            event.stopPropagation();
            setIsCollapsed((prev) => !prev);
          }}
        >
          <ChevronDown
            className={cn(
              "w-4 h-4 transition-transform duration-200",
              isCollapsed && "-rotate-90"
            )}
          />
          <h2 className="h4">{title}</h2>
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger>
                <NewTabToggle href={title} />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">View Only the {title} Tab</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        {title === "Not Started" && (
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <Dialog>
                <TooltipTrigger>
                  <DialogTrigger className="w-5 h-5">
                    <Info className="h-5 w-5 mr-3 cursor-pointer" />
                  </DialogTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Useful Tips</p>
                </TooltipContent>
                <DialogContent className="sm:max-w-[450px]">
                  <DialogHeader>
                    <DialogTitle>Useful Tips</DialogTitle>
                    <DialogDescription className="text-color-black">
                      You can scroll the table sideways by holding shift and
                      spinning the wheel.
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            </Tooltip>
          </TooltipProvider>
        )}
        {action}
      </div>
      {!isCollapsed && children}
    </section>
  );
}
