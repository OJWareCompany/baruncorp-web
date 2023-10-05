import Link from "next/link";
import React from "react";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/PageHeader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const title = "Project Intake Portal";

export default function Page() {
  return (
    <div className="flex flex-col gap-2">
      <PageHeader
        items={[{ href: "/project-intake-portal", name: title }]}
        title={title}
      />
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Information</AlertTitle>
        <AlertDescription className="py-3">
          <p>
            Please send an email to{" "}
            <a href="mailto:newjobs@baruncorp.com" className="underline">
              newjobs@baruncorp.com
            </a>{" "}
            if you need to:
          </p>
          <ul className="list-disc pl-6 my-2">
            <li>Add additional services to an active service order</li>
            <li>
              Send us updated information for an active service order or for a
              service order that is on hold
            </li>
            <li>Any other questions or issues concerning service orders</li>
          </ul>
          <p>
            Please send an email to{" "}
            <a href="mailto:chrisk@baruncorp.com" className="underline">
              chrisk@baruncorp.com
            </a>{" "}
            for any matter relating to the portal.
          </p>
        </AlertDescription>
      </Alert>
      <Button asChild>
        <Link href={`/project-intake-portal/new-service-order`}>
          New Service Order
        </Link>
      </Button>
    </div>
  );
}
