import JobsTable from "./JobsTable";
import CollapsibleSection from "@/components/CollapsibleSection";
import PageHeader from "@/components/PageHeader";

export default function Page() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader items={[{ href: "/", name: "Home" }]} />
      <CollapsibleSection title="All">
        <JobsTable type="All" />
      </CollapsibleSection>
      <CollapsibleSection title="Not Started">
        <JobsTable type="Not Started" />
      </CollapsibleSection>
      <CollapsibleSection title="In Progress">
        <JobsTable type="In Progress" />
      </CollapsibleSection>
      <CollapsibleSection title="Completed">
        <JobsTable type="Completed" />
      </CollapsibleSection>
      <CollapsibleSection title="On Hold">
        <JobsTable type="On Hold" />
      </CollapsibleSection>
      <CollapsibleSection title="Canceled">
        <JobsTable type="Canceled" />
      </CollapsibleSection>
    </div>
  );
}
