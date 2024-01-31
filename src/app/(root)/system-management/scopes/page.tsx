import NewServiceSheet from "./NewServiceSheet";
import ServicesTable from "./ServicesTable";
import PageHeader from "@/components/PageHeader";

export default function Page() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        items={[{ href: "/system-management/scopes", name: "Scopes" }]}
        action={<NewServiceSheet />}
      />
      <ServicesTable />
    </div>
  );
}
