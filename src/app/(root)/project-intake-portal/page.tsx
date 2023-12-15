import Link from "next/link";
import React from "react";
import Information from "./Information";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/PageHeader";

export default function Page() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        items={[
          { href: "/project-intake-portal", name: "Project Intake Portal" },
        ]}
      />
      <Information />
      <Button asChild>
        <Link href={`/project-intake-portal/new-service-order`}>
          New Service Order
        </Link>
      </Button>
    </div>
  );
}
