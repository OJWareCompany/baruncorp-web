"use client";
import { useMemo } from "react";
import { ServicePaginatedResponseDto, ServiceResponseDto } from "@/api";
import { serviceColumns } from "@/columns/service";
import PageHeader from "@/components/PageHeader";
import BaseTable from "@/components/table/BaseTable";
import useAllServicesQuery from "@/queries/useAllServicesQuery";
interface Props {
  initialServices: ServicePaginatedResponseDto | null;
}

export default function Client({ initialServices }: Props) {
  const title = "Tasks";

  const { data: services } = useAllServicesQuery(initialServices);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        items={[{ href: "/system-management/tasks", name: title }]}
        title={title}
      />
      <BaseTable
        columns={serviceColumns}
        data={services?.items ?? []}
        getRowId={({ id }) => id}
      />
    </div>
  );
}
