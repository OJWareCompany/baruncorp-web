import JobsTable from "./JobsTable";
import SocketListener from "./SocketListener";
import PageHeader from "@/components/PageHeader";
import CollapsibleSection from "@/components/CollapsibleSection";

export default function Page() {
  return (
    <div className="flex flex-col gap-4">
      <SocketListener />
      <PageHeader items={[{ href: "/workspace", name: "Workspace" }]} />
      <CollapsibleSection title="All">
        <JobsTable type="All" />
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
