import CouriersTable from "./CouriersTable";
import NewCourierDialog from "./NewCourierDialog";
import PageHeader from "@/components/PageHeader";

export default function Page() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        items={[{ href: "/system-management/couriers", name: "Couriers" }]}
        action={<NewCourierDialog />}
      />
      <CouriersTable />
    </div>
  );
}
