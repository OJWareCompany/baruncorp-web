"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      <h2 className="h2 border-b-0 p-0 mb-2">Something went wrong</h2>
      <p className="mb-5 text-center">
        Please try again in a few minutes.
        <br />
        If the problem persists, please contact a Barun Corp Manager.
      </p>
      <Button asChild>
        <Link href="/">Return Home</Link>
      </Button>
    </div>
  );
}
