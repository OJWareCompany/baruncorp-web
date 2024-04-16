"use client";
import JobsTableForClient from "./JobsTableForClient";
import JobsTableForMember from "./JobsTableForMember";
import { useProfileContext } from "./ProfileProvider";
import PageHeader from "@/components/PageHeader";
import NewTabCollapsibleSection from "@/components/NewTabCollapsibleSeciton";
import GlobalSearch from "@/components/table/GlobalSearch";

export default function Page() {
  const { isBarunCorpMember } = useProfileContext();

  // 멤버인 경우
  if (isBarunCorpMember) {
    const TABLE_NAME = "JobsForMember";

    const globalJobNameSearchParamName = `${TABLE_NAME}JobName`;
    const globalProjectNumberSearchParamName = `${TABLE_NAME}ProjectNumber`;
    const globalPropertyOwnerSearchParamName = `${TABLE_NAME}PropertyOwner`;
    const globalPageIndexSearchParamName = `${TABLE_NAME}PageIndex`;
    return (
      <div className="space-y-2">
        <PageHeader items={[{ href: "/", name: "Home" }]} />
        <GlobalSearch
          searchParamOptions={{
            jobNameSearchParamName: globalJobNameSearchParamName,
            projectNumberSearchParamName: globalProjectNumberSearchParamName,
            propertyOwnerSearchParamName: globalPropertyOwnerSearchParamName,
          }}
          pageIndexSearchParamName={globalPageIndexSearchParamName}
        />
        <div className="space-y-6">
          <NewTabCollapsibleSection title="Not Started">
            <JobsTableForMember type="Not Started" />
          </NewTabCollapsibleSection>
          <NewTabCollapsibleSection title="In Progress">
            <JobsTableForMember type="In Progress" />
          </NewTabCollapsibleSection>
          <NewTabCollapsibleSection title="Completed">
            <JobsTableForMember type="Completed" />
          </NewTabCollapsibleSection>
          <NewTabCollapsibleSection title="Sent To Client">
            <JobsTableForMember type="Sent To Client" />
          </NewTabCollapsibleSection>
          <NewTabCollapsibleSection title="On Hold">
            <JobsTableForMember type="On Hold" />
          </NewTabCollapsibleSection>
          <NewTabCollapsibleSection title="Canceled">
            <JobsTableForMember type="Canceled" />
          </NewTabCollapsibleSection>
          <NewTabCollapsibleSection title="Canceled (Invoice)">
            <JobsTableForMember type="Canceled (Invoice)" />
          </NewTabCollapsibleSection>
          <NewTabCollapsibleSection title="All">
            <JobsTableForMember type="All" />
          </NewTabCollapsibleSection>
        </div>
      </div>
    );
  }
  const TABLE_NAME = "JobsForClient";

  const globalJobNameSearchParamName = `${TABLE_NAME}JobName`;
  const globalProjectNumberSearchParamName = `${TABLE_NAME}ProjectNumber`;
  const globalPropertyOwnerSearchParamName = `${TABLE_NAME}PropertyOwner`;
  const globalPageIndexSearchParamName = `${TABLE_NAME}PageIndex`;
  // 클라이언트인 경우
  return (
    <div className="space-y-4">
      <PageHeader items={[{ href: "/", name: "Home" }]} />
      <GlobalSearch
        searchParamOptions={{
          jobNameSearchParamName: globalJobNameSearchParamName,
          projectNumberSearchParamName: globalProjectNumberSearchParamName,
          propertyOwnerSearchParamName: globalPropertyOwnerSearchParamName,
        }}
        pageIndexSearchParamName={globalPageIndexSearchParamName}
      />
      <div className="space-y-6">
        <NewTabCollapsibleSection title="Not Started">
          <JobsTableForClient type="Not Started" />
        </NewTabCollapsibleSection>
        <NewTabCollapsibleSection title="In Progress">
          <JobsTableForClient type="In Progress" />
        </NewTabCollapsibleSection>
        <NewTabCollapsibleSection title="Completed">
          <JobsTableForClient type="Completed" />
        </NewTabCollapsibleSection>
        <NewTabCollapsibleSection title="Sent To Client">
          <JobsTableForClient type="Sent To Client" />
        </NewTabCollapsibleSection>
        <NewTabCollapsibleSection title="On Hold">
          <JobsTableForClient type="On Hold" />
        </NewTabCollapsibleSection>
        <NewTabCollapsibleSection title="Canceled">
          <JobsTableForClient type="Canceled" />
        </NewTabCollapsibleSection>
        <NewTabCollapsibleSection title="Canceled (Invoice)">
          <JobsTableForClient type="Canceled (Invoice)" />
        </NewTabCollapsibleSection>
        <NewTabCollapsibleSection title="All">
          <JobsTableForClient type="All" />
        </NewTabCollapsibleSection>
      </div>
    </div>
  );
}
