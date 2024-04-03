"use client";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  href: string;
  className?: string;
}

export default function NewTabToggle({ href }: Props) {
  const hrefMap: Record<string, string> = {
    "Not Started": "./newtabs/not-started",
    "In Progress": "./newtabs/in-progress",
    Completed: "./newtabs/completed",
    "Sent To Client": "./newtabs/sent-to-client",
    "On Hold": "./newtabs/on-hold",
    Canceled: "./newtabs/canceled",
    "Canceled (Invoice)": "./newtabs/canceled-invoice",
    All: "./newtabs/all",
  };

  const hrefValue = hrefMap[href] || "";

  return (
    <Button
      size={"icon"}
      variant={"ghost"}
      className="w-4 h-4 ml-3"
      onClick={(event) => {
        event.stopPropagation();
      }}
    >
      <Link href={hrefValue} className="ml-3" target="_blank">
        <ExternalLink className="w-5 h-5" />
      </Link>
    </Button>
  );
}
