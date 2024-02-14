import SchedulesTable from "./SchedulesTable";
import PageHeader from "@/components/PageHeader";

export default function Page() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        items={[{ href: "/system-management/schedule", name: "Schedule" }]}
      />
      <SchedulesTable />
    </div>
  );
}
