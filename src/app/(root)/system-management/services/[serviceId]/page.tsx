"use client";
import ServiceForm from "./ServiceForm";
import TasksTable from "./TasksTable";
import PageHeader from "@/components/PageHeader";
import useServiceQuery from "@/queries/useServiceQuery";
import PageLoading from "@/components/PageLoading";
import useNotFound from "@/hook/useNotFound";

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
  console.log("🚀 ~ file: page.tsx:21 ~ Page ~ service:", service);
  useNotFound(serviceQueryError);

  if (isServiceQueryLoading || service == null) {
    return <PageLoading />;
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        items={[
          { href: "/system-management/services", name: "Services" },
          {
            href: `/system-management/services/${serviceId}}`,
            name: service.name,
          },
        ]}
      />
      <div className="space-y-6">
        <ServiceForm service={service} />
        <section>
          <h2 className="h4 mb-2">Tasks Related to Service</h2>
          <TasksTable service={service} />
        </section>
      </div>
    </div>
  );
}
