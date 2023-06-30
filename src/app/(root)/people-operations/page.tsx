import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Page() {
  return (
    <div>
      <h1 className="h3">People Operations</h1>
      <Button asChild>
        <Link href={"/people-operations/invitation"}>Invitation</Link>
      </Button>
    </div>
  );
}
