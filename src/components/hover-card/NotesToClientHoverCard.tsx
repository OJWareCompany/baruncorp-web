import React from "react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";

interface Props {
  value: string;
}

export default function NotesToClientHoverCard({ value }: Props) {
  return (
    <HoverCard openDelay={0} closeDelay={100}>
      <HoverCardTrigger className="underline">View Detail</HoverCardTrigger>
      <HoverCardContent
        className="max-w-[400px] w-[auto] max-h-[300px] overflow-y-auto cursor-default"
        side="top"
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        {value}
      </HoverCardContent>
    </HoverCard>
  );
}
