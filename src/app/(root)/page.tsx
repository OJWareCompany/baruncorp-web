"use client";
import { PaginationState } from "@tanstack/react-table";
import { useMemo } from "react";
import { useLocalStorage } from "@uidotdev/usehooks";
import { useSearchParams } from "next/navigation";
import JobsTableForClient from "./JobsTableForClient";
import JobsTableForMember from "./JobsTableForMember";
import { useProfileContext } from "./ProfileProvider";
import PageHeader from "@/components/PageHeader";
import NewTabCollapsibleSection from "@/components/NewTabCollapsibleSeciton";
import NameSearch from "@/components/table/NameSearch";
import { FindMyOrderedJobPaginatedHttpControllerFindJobParams } from "@/api/api-spec";
import useJobsQuery from "@/queries/useJobsQuery";

export default function Page() {
  const { isBarunCorpMember } = useProfileContext();
  const searchParams = useSearchParams();

  const TABLE_NAME = "JobsForMember";
  const RELATIVE_PATH = "src/app/(root)/JobsTableForMember.tsx";
  const [pageSize, setPageSize] = useLocalStorage<number>(
    `${RELATIVE_PATH}`,
    10
  );

  const globalJobNameSearchParamName = `${TABLE_NAME}JobName`;
  const globalProjectNumberSearchParamName = `${TABLE_NAME}ProjectNumber`;
  const globalPropertyOwnerSearchParamName = `${TABLE_NAME}PropertyOwner`;
  const globalPageIndexSearchParamName = `${TABLE_NAME}PageIndex`;

  const globalJobNameSearchParam =
    searchParams.get(encodeURIComponent(globalJobNameSearchParamName)) ?? "";
  const globalProjectNumberSearchParam =
    searchParams.get(encodeURIComponent(globalProjectNumberSearchParamName)) ??
    "";
  const globalPropertyOwnerSearchParam =
    searchParams.get(encodeURIComponent(globalPropertyOwnerSearchParamName)) ??
    "";
  const globalPagination: PaginationState = {
    pageIndex: searchParams.get(
      encodeURIComponent(globalPageIndexSearchParamName)
    )
      ? Number(
          searchParams.get(encodeURIComponent(globalPageIndexSearchParamName))
        )
      : 0,
    pageSize,
  };

  const params: FindMyOrderedJobPaginatedHttpControllerFindJobParams = useMemo(
    () => ({
      page: globalPagination.pageIndex + 1,
      limit: globalPagination.pageSize,
      jobName: globalJobNameSearchParam,

      projectNumber: globalProjectNumberSearchParam,
      propertyOwner: globalPropertyOwnerSearchParam,
    }),
    [
      globalPagination.pageIndex,
      globalPagination.pageSize,
      globalJobNameSearchParam,
      globalProjectNumberSearchParam,
      globalPropertyOwnerSearchParam,
    ]
  );

  const {} = useJobsQuery(params, true);

  // 멤버인 경우
  if (isBarunCorpMember) {
    return (
      <div className="space-y-4">
        <PageHeader items={[{ href: "/", name: "Home" }]} />
        <NameSearch
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

  // 클라이언트인 경우
  return (
    <div className="space-y-4">
      <PageHeader items={[{ href: "/", name: "Home" }]} />
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
