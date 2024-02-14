import PeriodSection from "./PeriodSection";
import Test from "./Test";
import InProgressTable from "./InProgressTable";
import PageHeader from "@/components/PageHeader";
import CollapsibleSection from "@/components/CollapsibleSection";

export default function Page() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        items={[
          { href: "/system-management/task-summary", name: "Task Summary" },
        ]}
      />
      <CollapsibleSection title="Overview of Current Tasks In Progress">
        <InProgressTable />
      </CollapsibleSection>
      <PeriodSection />
      <Test />
    </div>
  );
}
