"use client";
import { useMemo } from "react";
import ProjectForm from "../common/ProjectForm";
import JobsRelatedToProjectTable from "../common/JobsRelatedToProjectTable";
import PageHeaderAction from "./PageHeaderAction";
import JobForm from "./JobForm";
import JobNotesTable from "./JobNoteTable";
import JobNoteForm from "./JobNoteForm";
import ScopesTable from "./ScopesTable";
import HistoryTable from "./HistoryTable";
import JobStatus from "./JobStatus";
import NewScopeSheet from "./NewScopeSheet";
import AlertDialogDataProvider from "./AlertDialogDataProvider";
import TrackingNumbersTable from "./TrackingNumbersTable";
import NewTrackingNumberDialog from "./NewTrackingNumberDialog";
import TotalJobPrice from "./TotalJobPrice";
import useProjectQuery from "@/queries/useProjectQuery";
import useJobQuery from "@/queries/useJobQuery";
import PageHeader from "@/components/PageHeader";
import useJobNotesQuery from "@/queries/useJobNotesQuery";
import PageLoading from "@/components/PageLoading";
import ItemsContainer from "@/components/ItemsContainer";
import useNotFound from "@/hook/useNotFound";
import CollapsibleSection from "@/components/CollapsibleSection";
import {
  ELECTRICAL_WET_STAMP_SERVICE_ID,
  STRUCTURAL_WET_STAMP_SERVICE_ID,
} from "@/lib/constants";
import {
  JobNoteDetailResponseDto,
  JobResponseDto,
  ProjectResponseDto,
} from "@/api/api-spec";
import { useProfileContext } from "@/app/(root)/ProfileProvider";

function getPageHeader({
  pageType,
  project,
  job,
}: {
  pageType: JobDetailPageType;
  project: ProjectResponseDto;
  job: JobResponseDto;
}) {
  switch (pageType) {
    case "HOME":
      return (
        <PageHeader
          items={[
            { href: "/", name: "Home" },
            { href: `/jobs/${job.id}`, name: job.jobName },
          ]}
          action={
            <PageHeaderAction job={job} project={project} pageType={pageType} />
          }
        />
      );
    case "WORKSPACE":
      return (
        <PageHeader
          items={[
            { href: "/workspace", name: "Workspace" },
            { href: `/workspace/jobs/${job.id}`, name: job.jobName },
          ]}
          action={
            <PageHeaderAction job={job} project={project} pageType={pageType} />
          }
        />
      );
    case "SYSTEM_MANAGEMENT":
      return (
        <PageHeader
          items={[
            { href: "/system-management/jobs", name: "Jobs" },
            { href: `/system-management/jobs/${job.id}`, name: job.jobName },
          ]}
          action={
            <PageHeaderAction job={job} project={project} pageType={pageType} />
          }
        />
      );
  }
}

interface Props {
  jobId: string;
  pageType: JobDetailPageType;
}

export default function JobDetailPage({ jobId, pageType }: Props) {
  const {
    data: job,
    isLoading: isJobQueryLoading,
    error: jobQueryError,
  } = useJobQuery(jobId);
  const projectId = job?.projectId ?? "";
  const {
    data: project,
    isLoading: isProjectQueryLoading,
    error: projectQueryError,
  } = useProjectQuery(projectId);
  const {
    data: jobNotes,
    isLoading: isJobNotesQueryLoading,
    error: jobNotesQueryError,
  } = useJobNotesQuery(jobId);
  useNotFound(jobQueryError);
  useNotFound(projectQueryError);
  useNotFound(jobNotesQueryError);

  const hasWetStamp = useMemo(() => {
    if (job == null) {
      return false;
    }

    return (
      job.orderedServices.findIndex(
        (value) =>
          value.serviceId === ELECTRICAL_WET_STAMP_SERVICE_ID ||
          value.serviceId === STRUCTURAL_WET_STAMP_SERVICE_ID
      ) !== -1
    );
  }, [job]);

  const {
    isBarunCorpMember,
    authority: { canViewScopePrice, canViewTaskCost },
  } = useProfileContext();
  const isHome = useMemo(() => pageType === "HOME", [pageType]);

  const processedJobNotesData = useMemo<JobNoteDetailResponseDto[]>(() => {
    if (jobNotes == null) {
      return [];
    }

    // 바른코프 멤버이면 필터링 X
    if (isBarunCorpMember) {
      return jobNotes.data;
    }

    if (isHome) {
      // 바른코프 멤버 아닌데, 홈이면 필터링
      return jobNotes.data.filter((value) => value.type === "RFI");
    } else {
      // 홈 아니면 필터링 X
      return jobNotes.data;
    }
  }, [isBarunCorpMember, isHome, jobNotes]);

  if (
    isJobQueryLoading ||
    job == null ||
    isProjectQueryLoading ||
    project == null ||
    isJobNotesQueryLoading ||
    jobNotes == null
  ) {
    return <PageLoading />;
  }

  /**
   * 바른코프 멤버 ✅
   * 바른코프 멤버아닌데, 홈 ❌
   * 바른코프 멤버아닌데, 워크스페이스 ✅
   */
  const isWorker = isBarunCorpMember || !isHome;

  return (
    <AlertDialogDataProvider>
      <div className="flex flex-col gap-4">
        {getPageHeader({ pageType, project, job })}
        <div className="space-y-6">
          <CollapsibleSection title="Project">
            <ProjectForm project={project} pageType={pageType} />
          </CollapsibleSection>
          <CollapsibleSection title="Jobs Related to Project">
            <JobsRelatedToProjectTable project={project} pageType={pageType} />
          </CollapsibleSection>
          <CollapsibleSection title="Job">
            <JobForm job={job} project={project} pageType={pageType} />
          </CollapsibleSection>
          <CollapsibleSection title="Job Note">
            <ItemsContainer>
              <JobNotesTable
                jobNotes={{
                  ...jobNotes,
                  data: processedJobNotesData,
                }}
                pageType={pageType}
              />
              {isWorker && <JobNoteForm job={job} />}
            </ItemsContainer>
          </CollapsibleSection>
          <CollapsibleSection title="Status">
            <JobStatus job={job} />
          </CollapsibleSection>
          <CollapsibleSection
            title="Scopes"
            action={isWorker && <NewScopeSheet job={job} />}
          >
            {isBarunCorpMember && canViewScopePrice && (
              <TotalJobPrice job={job} />
            )}
            <ScopesTable job={job} project={project} pageType={pageType} />
          </CollapsibleSection>
          {hasWetStamp && (
            <CollapsibleSection
              title="Tracking Numbers"
              action={isWorker && <NewTrackingNumberDialog job={job} />}
            >
              <TrackingNumbersTable job={job} pageType={pageType} />
            </CollapsibleSection>
          )}
          {isWorker && canViewScopePrice && canViewTaskCost && (
            <CollapsibleSection title="History" isInitiallyCollapsed={true}>
              <HistoryTable job={job} />
            </CollapsibleSection>
          )}
        </div>
      </div>
    </AlertDialogDataProvider>
  );
}
