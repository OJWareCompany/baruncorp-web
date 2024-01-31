import React from "react";
import { Plate, PlateContent } from "@udecode/plate-common";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";
import { basicEditorPlugins } from "@/lib/plate/plugins";
import { getEditorValue } from "@/lib/plate-utils";

interface Props {
  value: string;
}

export default function AdditionalInformationHoverCard({ value }: Props) {
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
        <Plate
          plugins={basicEditorPlugins}
          readOnly
          value={getEditorValue(value)}
        >
          <PlateContent />
        </Plate>
      </HoverCardContent>
    </HoverCard>
  );
}
