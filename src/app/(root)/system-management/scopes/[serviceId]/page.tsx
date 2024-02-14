"use client";
import ServiceForm from "./ServiceForm";
import TasksTable from "./TasksTable";
import PageHeaderAction from "./PageHeaderAction";
import PageHeader from "@/components/PageHeader";
import useServiceQuery from "@/queries/useServiceQuery";
import PageLoading from "@/components/PageLoading";
import useNotFound from "@/hook/useNotFound";
import CollapsibleSection from "@/components/CollapsibleSection";

interface Props {
  params: {
    serviceId: string;
  };
}

export default function Page({ params: { serviceId } }: Props) {
  const {
    data: service,
    isLoading: isServiceQueryLoading,
    error: serviceQueryError,
  } = useServiceQuery(serviceId);
  useNotFound(serviceQueryError);

  if (isServiceQueryLoading || service == null) {
    return <PageLoading />;
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        items={[
          { href: "/system-management/scopes", name: "Scopes" },
          {
            href: `/system-management/scopes/${serviceId}}`,
            name: service.name,
          },
        ]}
        action={<PageHeaderAction scopeId={serviceId} />}
      />
      <div className="space-y-6">
        <ServiceForm service={service} />
        <CollapsibleSection title="Tasks Related to Scope">
          <TasksTable service={service} />
        </CollapsibleSection>
      </div>
    </div>
  );
}
