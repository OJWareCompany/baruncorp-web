"use client";
import { useMemo } from "react";
import { useSession } from "next-auth/react";
import PageHeaderAction from "./PageHeaderAction";
import ProjectSection from "./ProjectSection";
import JobForm from "./JobForm";
import JobNotesTable from "./JobNoteTable";
import JobNoteForm from "./JobNoteForm";
import ScopesTable from "./ScopesTable";
import JobsTable from "./JobsTable";
import HistoryTable from "./HistoryTable";
import JobStatus from "./JobStatus";
import NewScopeSheet from "./NewScopeSheet";
import AlertDialogDataProvider from "./AlertDialogDataProvider";
import TrackingNumbersTable from "./TrackingNumbersTable";
import NewTrackingNumberDialog from "./NewTrackingNumberDialog";
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

function getPageHeader({
  pageType,
  project,
  job,
}: {
  pageType: PageType;
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
  pageType: PageType;
}

export default function JobDetailPage({ jobId, pageType }: Props) {
  const { data: session } = useSession();
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

  const isBarunCorpMember = useMemo(
    () => session?.isBarunCorpMember ?? false,
    [session?.isBarunCorpMember]
  );
  const isHome = useMemo(() => pageType === "HOME", [pageType]);

  const processedJobNotesData = useMemo<JobNoteDetailResponseDto[]>(() => {
    if (jobNotes == null) {
      return [];
    }

    // 바른코프 멤버이면 필터링 X
    if (isBarunCorpMember) {
      return jobNotes.data;
    }

    // 바른코프 멤버 아닌데, 홈이면 필터링
    if (isHome) {
      return jobNotes.data.filter((value) => value.type === "RFI");
    }

    // 홈 아니면 필터링 X
    return jobNotes.data;
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

  return (
    <AlertDialogDataProvider>
      <div className="flex flex-col gap-4">
        {getPageHeader({ pageType, project, job })}
        <div className="space-y-6">
          <ProjectSection project={project} pageType={pageType} />
          <CollapsibleSection title="Jobs Related to Project">
            <JobsTable project={project} pageType={pageType} />
          </CollapsibleSection>
          <CollapsibleSection title="Job">
            <JobForm
              job={job}
              project={project}
              disabled={!isBarunCorpMember && isHome}
            />
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
              {(isBarunCorpMember || !isHome) && <JobNoteForm job={job} />}
            </ItemsContainer>
          </CollapsibleSection>
          <CollapsibleSection title="Status">
            <JobStatus job={job} disabled={!isBarunCorpMember && isHome} />
          </CollapsibleSection>
          <CollapsibleSection
            title="Scopes"
            action={
              (isBarunCorpMember || !isHome) && <NewScopeSheet job={job} />
            }
          >
            <ScopesTable job={job} project={project} />
          </CollapsibleSection>
          {hasWetStamp && (
            <CollapsibleSection
              title="Tracking Numbers"
              action={
                (isBarunCorpMember || !isHome) && (
                  <NewTrackingNumberDialog job={job} />
                )
              }
            >
              <TrackingNumbersTable job={job} />
            </CollapsibleSection>
          )}
          {(isBarunCorpMember || !isHome) && (
            <CollapsibleSection title="History">
              <HistoryTable job={job} />
            </CollapsibleSection>
          )}
        </div>
      </div>
    </AlertDialogDataProvider>
  );
}
