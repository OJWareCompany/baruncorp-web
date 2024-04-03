"use client";
import { ChevronDown } from "lucide-react";
import { ReactNode, useState } from "react";
import { cn } from "@/lib/utils";
import NewTabToggle from "@/app/(root)/NewTabToggle";

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
          <NewTabToggle href={title} />
        </div>
        {action}
      </div>
      {!isCollapsed && children}
    </section>
  );
}
