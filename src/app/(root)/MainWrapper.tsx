"use client";

import { useExpandContext } from "./ExpandProvider";
import { cn } from "@/lib/utils";

interface Props {
  children: React.ReactNode;
}

export default function MainWrapper({ children }: Props) {
  const { isSelected: isExpanded } = useExpandContext();

  return (
    <main
      className={cn("container px-6 pb-12", isExpanded && "max-w-[2500px]")}
    >
      {children}
    </main>
  );
}
