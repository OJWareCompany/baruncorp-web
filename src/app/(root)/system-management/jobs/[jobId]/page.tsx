"use client";
import { useMemo } from "react";
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

interface Props {
  params: {
    jobId: string;
  };
}

export default function Page({ params: { jobId } }: Props) {
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
        <PageHeader
          items={[
            { href: "/system-management/jobs", name: "Jobs" },
            { href: `/system-management/jobs/${job.id}`, name: job.jobName },
          ]}
          action={<PageHeaderAction job={job} project={project} />}
        />
        <div className="space-y-6">
          <ProjectSection project={project} />
          <CollapsibleSection title="Jobs Related to Project">
            <JobsTable project={project} />
          </CollapsibleSection>
          <CollapsibleSection title="Job">
            <JobForm job={job} project={project} />
          </CollapsibleSection>
          <CollapsibleSection title="Job Note">
            <ItemsContainer>
              <JobNotesTable jobNotes={jobNotes} />
              <JobNoteForm job={job} />
            </ItemsContainer>
          </CollapsibleSection>
          <CollapsibleSection title="Status">
            <JobStatus job={job} />
          </CollapsibleSection>
          <CollapsibleSection
            title="Scopes"
            action={<NewScopeSheet job={job} />}
          >
            <ScopesTable job={job} project={project} />
          </CollapsibleSection>
          {hasWetStamp && (
            <CollapsibleSection
              title="Tracking Numbers"
              action={<NewTrackingNumberDialog job={job} />}
            >
              <TrackingNumbersTable job={job} />
            </CollapsibleSection>
          )}
          <CollapsibleSection title="History">
            <HistoryTable job={job} />
          </CollapsibleSection>
        </div>
      </div>
    </AlertDialogDataProvider>
  );
}
