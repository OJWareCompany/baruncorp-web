import OrganizationSection from "./OrganizationSection";
import NewServiceOrderDataProvider from "./NewServiceOrderDataProvider";
import ProjectSection from "./ProjectSection";
import JobSection from "./JobSection";
import PageHeader from "@/components/PageHeader";

export default function Page() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        items={[
          { href: "/project-intake-portal", name: "Project Intake Portal" },
          {
            href: "/project-intake-portal/new-service-order",
            name: "New Service Order",
          },
        ]}
      />
      <NewServiceOrderDataProvider>
        <OrganizationSection />
        <ProjectSection />
        <JobSection />
      </NewServiceOrderDataProvider>
    </div>
  );
}
