"use client";
import { useProfileContext } from "../../ProfileProvider";
import OrganizationSection from "./OrganizationSection";
import NewServiceOrderDataProvider from "./NewServiceOrderDataProvider";
import ProjectSection from "./ProjectSection";
import JobSection from "./JobSection";
import PageHeader from "@/components/PageHeader";
import PageLoading from "@/components/PageLoading";

export default function Page() {
  const { isInitialized } = useProfileContext();

  // initialized된 상태에서 NewServiceOrderDataProvider를 렌더링해야, 제대로된 초기값을 집어넣을 수 있다.
  if (!isInitialized) {
    return <PageLoading />;
  }

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
