"use client";
import { ChevronDown } from "lucide-react";
import { ReactNode, useState } from "react";
import { cn } from "@/lib/utils";

interface Props {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}

export default function CollapsibleSection({ title, children, action }: Props) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between">
        <div
          className="inline-flex items-center cursor-pointer gap-1"
          onClick={() => {
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
        </div>
        {action}
      </div>
      {!isCollapsed && children}
    </section>
  );
}
