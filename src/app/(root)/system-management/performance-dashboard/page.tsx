import TasksCompletedSection from "./TasksCompletedSection";
import PageHeader from "@/components/PageHeader";

export default function Page() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        items={[
          {
            href: "/system-management/performance-dashboard",
            name: "Performance Dashboard",
          },
        ]}
      />
      <TasksCompletedSection />
    </div>
  );
}
