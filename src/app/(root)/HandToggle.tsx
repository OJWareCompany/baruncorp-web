"use client";
import { Grab, Hand } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function HandToggle() {
  const [pressed, setPressed] = useState(false);

  return (
    <Button
      size={"icon"}
      variant={"ghost"}
      onClick={() => {
        setPressed((prev) => !prev);
      }}
    >
      {pressed ? (
        <Hand className="h-4 w-4 text-green-600" />
      ) : (
        <Grab className="h-4 w-4" />
      )}
    </Button>
  );
}
