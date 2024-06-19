"use client";
import { ChevronDown } from "lucide-react";
import { ReactNode, useState } from "react";
import { cn } from "@/lib/utils";
import NewTabToggle from "@/app/(root)/NewTabToggle";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
        {action}
      </div>
      {!isCollapsed && children}
    </section>
  );
}
