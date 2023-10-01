"use client";
import { useMemo } from "react";
import { ServiceResponseDto } from "@/api";
import { ServiceTableRowData, serviceTableColumn } from "@/columns/service";
import PageHeader from "@/components/PageHeader";
import BaseTable from "@/components/table/BaseTable";
import useAllServicesQuery from "@/queries/useAllServicesQuery";
interface Props {
  initialServices: ServiceResponseDto[] | null;
}

export default function Client({ initialServices }: Props) {
  const title = "Tasks";

  const { data: services } = useAllServicesQuery(initialServices);

  const serviceTableData = useMemo(
    () =>
      services
        ?.map<ServiceTableRowData>((value) => {
          const { basePrice, billingCode, id, name } = value;

          return {
            basePrice,
            billingCode,
            id,
            name,
          };
        })
        .sort((a, b) => (a.name < b.name ? -1 : 1)),
    [services]
  );

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        items={[{ href: "/system-management/tasks", name: title }]}
        title={title}
      />
      <BaseTable columns={serviceTableColumn} data={serviceTableData ?? []} />
    </div>
  );
}
