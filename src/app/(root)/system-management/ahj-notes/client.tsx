"use client";

import { PaginationState } from "@tanstack/react-table";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import useProjectsQuery from "@/queries/useProjectsQuery";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from "@/components/ui/breadcrumb";
import {
  AhjNotePaginatedResponseDto,
  ProjectPaginatedResponseDto,
} from "@/api";
import DataTable from "@/components/table/DataTable";
import Pagination from "@/components/table/Pagination";
import { ProjectTableRowData, projectTableColumns } from "@/columns/project";
import useAhjNotesQuery from "@/queries/useAhjNotesQuery";
import { AhjNoteTableRowData, ahjNoteTableColumns } from "@/columns/ahj-note";
import AhjNoteTable from "./components/AhjNoteTable";

function PageHeader() {
  const title = "AHJ Notes";

  return (
    <div className="py-2">
      <Breadcrumb>
        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink as={Link} href="/system-management/ahj-notes">
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
  initialAhjNotes: AhjNotePaginatedResponseDto;
}

export default function Client({ initialAhjNotes }: Props) {
  return (
    <>
      <PageHeader />
      <div className="py-4">
        <AhjNoteTable initialAhjNotes={initialAhjNotes} />
      </div>
    </>
  );
}
