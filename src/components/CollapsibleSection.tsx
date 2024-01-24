"use client";
import { ChevronDown } from "lucide-react";
import { ReactNode, useState } from "react";
import { cn } from "@/lib/utils";

interface Props {
  title: string;
  children: ReactNode;
}

export default function CollapsibleSection({ title, children }: Props) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <section className="space-y-2">
      <div
        className="inline-flex items-center gap-1 cursor-pointer"
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
      {!isCollapsed && children}
    </section>
  );
}
