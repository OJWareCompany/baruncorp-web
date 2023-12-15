import OrganizationsTable from "./OrganizationsTable";
import NewOrganizationSheet from "./NewOrganizationSheet";
import PageHeader from "@/components/PageHeader";

export default function Page() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        items={[
          { href: "/system-management/organizations", name: "Organizations" },
        ]}
        action={<NewOrganizationSheet />}
      />
      <OrganizationsTable />
    </div>
  );
}
