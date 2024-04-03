"use client";

import { useProfileContext } from "../../ProfileProvider";
import JobsTableForMember from "../../JobsTableForMember";
import JobsTableForClient from "../../JobsTableForClient";
import PageHeader from "@/components/PageHeader";

export default function Page() {
  const { isBarunCorpMember } = useProfileContext();

  // 멤버인 경우
  if (isBarunCorpMember) {
    return (
      <div className="space-y-4">
        <PageHeader items={[{ href: "../on-hold", name: "On Hold" }]} />
        <div className="space-y-6">
          <JobsTableForMember type="On Hold" />
        </div>
      </div>
    );
  }

  // 클라이언트인 경우
  return (
    <div className="space-y-4">
      <PageHeader items={[{ href: "../on-hold", name: "On Hold" }]} />
      <div className="space-y-6">
        <JobsTableForClient type="On Hold" />
      </div>
    </div>
  );
}
