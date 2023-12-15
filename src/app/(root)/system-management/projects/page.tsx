import ProjectsTable from "./ProjectsTable";
import PageHeader from "@/components/PageHeader";

export default function Page() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        items={[{ href: "/system-management/projects", name: "Projects" }]}
      />
      <ProjectsTable />
    </div>
  );
}
