"use client";


import Link from "next/link";

import ProjectTable from "./components/ProjectTable";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from "@/components/ui/breadcrumb";
import { ProjectPaginatedResponseDto } from "@/api";

function PageHeader() {
  const title = "Projects";

  return (
    <div className="py-2">
      <Breadcrumb>
        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink as={Link} href="/system-management/projects">
            {title}
          </BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>
      <div className="flex justify-between items-center h-9">
        <h3 className="h3">{title}</h3>
      </div>
    </div>
  );
}
interface Props {
  initialProjects: ProjectPaginatedResponseDto;
}

export default function Client({ initialProjects }: Props) {
  return (
    <>
      <PageHeader />
      <div className="py-4">
        <ProjectTable initialProjects={initialProjects} />
      </div>
    </>
  );
}
