import NewServiceOrderForm from "./NewServiceOrderForm";
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
      <NewServiceOrderForm />
    </div>
  );
}
