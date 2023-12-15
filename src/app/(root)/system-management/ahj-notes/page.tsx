import AhjNotesTable from "./AhjNotesTable";
import PageHeader from "@/components/PageHeader";

export default function Page() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        items={[{ href: "/system-management/ahj-notes", name: "AHJ Notes" }]}
      />
      <AhjNotesTable />
    </div>
  );
}
