"use client";
import { useSession } from "next-auth/react";
import OrganizationSection from "./OrganizationSection";
import NewServiceOrderDataProvider from "./NewServiceOrderDataProvider";
import ProjectSection from "./ProjectSection";
import JobSection from "./JobSection";
import PageLoading from "@/components/PageLoading";
import PageHeader from "@/components/PageHeader";

export default function Page() {
  const { data: session, status } = useSession();

  if (status !== "authenticated") {
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
      <NewServiceOrderDataProvider session={session}>
        <OrganizationSection />
        <ProjectSection />
        <JobSection />
      </NewServiceOrderDataProvider>
    </div>
  );
}
