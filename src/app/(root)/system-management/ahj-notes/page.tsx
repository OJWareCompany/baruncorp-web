import AhjNotesTable from "./AhjNotesTable";
import NewAhjNoteSheet from "./NewAhjNoteSheet";
import PageHeader from "@/components/PageHeader";

export default function Page() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        items={[{ href: "/system-management/ahj-notes", name: "AHJ Notes" }]}
        action={<NewAhjNoteSheet />}
      />
      <AhjNotesTable />
    </div>
  );
}
