"use client";
import { useSearchParams } from "next/navigation";
import JobsTable from "./JobsTable";
import SocketListener from "./SocketListener";
import PageHeader from "@/components/PageHeader";
import CollapsibleSection from "@/components/CollapsibleSection";
import GlobalSearch from "@/components/table/GlobalSearch";

export default function Page() {
  const searchParams = useSearchParams();

  const TABLE_NAME = "Jobs";

  const globalJobNameSearchParamName = `${TABLE_NAME}JobName`;
  const globalProjectNumberSearchParamName = `${TABLE_NAME}ProjectNumber`;
  const globalPropertyOwnerSearchParamName = `${TABLE_NAME}PropertyOwner`;
  const globalPageIndexSearchParamName = `${TABLE_NAME}PageIndex`;

  return (
    <>
      <div className="space-y-4">
        <PageHeader items={[{ href: "/workspace", name: "Workspace" }]} />
        <GlobalSearch
          searchParamOptions={{
            jobNameSearchParamName: globalJobNameSearchParamName,
            projectNumberSearchParamName: globalProjectNumberSearchParamName,
            propertyOwnerSearchParamName: globalPropertyOwnerSearchParamName,
          }}
          pageIndexSearchParamName={globalPageIndexSearchParamName}
        />
        <div className="space-y-6">
          <CollapsibleSection title="In Progress">
            <JobsTable type="In Progress" />
          </CollapsibleSection>
          <CollapsibleSection title="Completed">
            <JobsTable type="Completed" />
          </CollapsibleSection>
          <CollapsibleSection title="All">
            <JobsTable type="All" />
          </CollapsibleSection>
        </div>
      </div>
      <SocketListener />
    </>
  );
}
