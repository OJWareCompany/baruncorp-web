"use client";
import JobsTableForClient from "./JobsTableForClient";
import { useProfileContext } from "./ProfileProvider";
import JobsTableForMember from "./JobsTableForMember";
import CollapsibleSection from "@/components/CollapsibleSection";
import PageHeader from "@/components/PageHeader";

export default function Page() {
  const { isBarunCorpMember } = useProfileContext();

  // 멤버인 경우
  if (isBarunCorpMember) {
    return (
      <div className="space-y-4">
        <PageHeader items={[{ href: "/", name: "Home" }]} />
        <div className="space-y-6">
          <CollapsibleSection title="Not Started">
            <JobsTableForMember type="Not Started" />
          </CollapsibleSection>
          <CollapsibleSection title="In Progress">
            <JobsTableForMember type="In Progress" />
          </CollapsibleSection>
          <CollapsibleSection title="Completed">
            <JobsTableForMember type="Completed" />
          </CollapsibleSection>
          <CollapsibleSection title="On Hold">
            <JobsTableForMember type="On Hold" />
          </CollapsibleSection>
          <CollapsibleSection title="Canceled">
            <JobsTableForMember type="Canceled" />
          </CollapsibleSection>
          <CollapsibleSection title="All">
            <JobsTableForMember type="All" />
          </CollapsibleSection>
        </div>
      </div>
    );
  }

  // 클라이언트인 경우
  return (
    <div className="space-y-4">
      <PageHeader items={[{ href: "/", name: "Home" }]} />
      <div className="space-y-6">
        <CollapsibleSection title="Not Started">
          <JobsTableForClient type="Not Started" />
        </CollapsibleSection>
        <CollapsibleSection title="In Progress">
          <JobsTableForClient type="In Progress" />
        </CollapsibleSection>
        <CollapsibleSection title="Completed">
          <JobsTableForClient type="Completed" />
        </CollapsibleSection>
        <CollapsibleSection title="On Hold">
          <JobsTableForClient type="On Hold" />
        </CollapsibleSection>
        <CollapsibleSection title="Canceled">
          <JobsTableForClient type="Canceled" />
        </CollapsibleSection>
        <CollapsibleSection title="All">
          <JobsTableForClient type="All" />
        </CollapsibleSection>
      </div>
    </div>
  );
}
