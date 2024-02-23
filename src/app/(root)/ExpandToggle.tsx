"use client";
import { Maximize2, Minimize2 } from "lucide-react";
import { useExpandContext } from "./ExpandProvider";
import { Button } from "@/components/ui/button";

export default function ExpandToggle() {
  const { toggle, isSelected } = useExpandContext();

  return (
    <Button
      size={"icon"}
      variant={"ghost"}
      onClick={() => {
        toggle();
      }}
    >
      {isSelected ? (
        <Minimize2 className="h-4 w-4" />
      ) : (
        <Maximize2 className="h-4 w-4" />
      )}
    </Button>
  );
}
