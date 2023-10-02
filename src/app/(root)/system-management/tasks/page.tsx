"use client";
import { serviceColumns } from "@/columns/service";
import PageHeader from "@/components/PageHeader";
import PageLoading from "@/components/PageLoading";
import BaseTable from "@/components/table/BaseTable";
import useAllServicesQuery from "@/queries/useAllServicesQuery";

const title = "Tasks";

export default function Page() {
  const { data: services, isLoading: isServicesQueryLoading } =
    useAllServicesQuery();

  if (isServicesQueryLoading) {
    return <PageLoading />;
  }

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
