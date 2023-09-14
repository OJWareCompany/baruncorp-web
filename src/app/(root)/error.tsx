"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DEFAULT_ERROR_TOAST_DESCRIPTION,
  DEFAULT_ERROR_TOAST_TITLE,
} from "@/lib/constants";

export default function NotFound() {
  return (
    <div className="py-4">
      <h2 className="h2 border-b-0">{DEFAULT_ERROR_TOAST_TITLE}</h2>
      <p className="mb-2">{DEFAULT_ERROR_TOAST_DESCRIPTION}</p>
      <Button asChild>
        <Link href="/">Return Home</Link>
      </Button>
    </div>
  );
}
