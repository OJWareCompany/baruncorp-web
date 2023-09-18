import Link from "next/link";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from "@/components/ui/breadcrumb";

function PageHeader() {
  const title = "Project Intake Portal";

  return (
    <div className="py-2">
      <Breadcrumb>
        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink as={Link} href="/project-intake-portal">
            {title}
          </BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>
      <div className="flex justify-between items-center h-9">
        <h3 className="h3">{title}</h3>
        <Button asChild size={"sm"}>
          <Link href="/project-intake-portal/new-service-order">
            New Service Order
          </Link>
        </Button>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <>
      <PageHeader />
      <div className="py-4">
        <div className="bg-muted h-[400px] flex items-center justify-center">
          <span className="h3">Informtaion Section</span>
        </div>
      </div>
    </>
  );
}
