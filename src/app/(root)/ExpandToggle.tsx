"use client";
import { Maximize2, Minimize2 } from "lucide-react";
import { ToggleState } from "react-stately";
import { Button } from "@/components/ui/button";

interface Props {
  toggleState: ToggleState;
}

export default function ExpandToggle({ toggleState }: Props) {
  return (
    <Button
      size={"icon"}
      variant={"ghost"}
      onClick={() => {
        toggleState.toggle();
      }}
    >
      {toggleState.isSelected ? (
        <Minimize2 className="h-4 w-4" />
      ) : (
        <Maximize2 className="h-4 w-4" />
      )}
    </Button>
  );
}
