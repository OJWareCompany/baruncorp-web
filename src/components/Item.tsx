import React from "react";
import { cn } from "@/lib/utils";

interface Props {
  children: React.ReactNode;
  className?: string;
}

export default function Item({ children, className }: Props) {
  return <div className={cn("flex flex-col gap-2", className)}>{children}</div>;
}
