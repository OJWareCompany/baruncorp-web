"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="py-4">
      <h2 className="h2 border-b-0">Something went wrong</h2>
      <p className="mb-2">
        Please try again in a few minutes. If the problem persists, please
        contact the Barun Corp Manager.
      </p>
      <Button asChild>
        <Link href="/">Return Home</Link>
      </Button>
    </div>
  );
}
