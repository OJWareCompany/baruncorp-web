"use client";
import { useSession } from "next-auth/react";
import PageHeaderAction from "./PageHeaderAction";
import ProjectSection from "./ProjectSection";
import JobForm from "./JobForm";
import JobNotesTable from "./JobNoteTable";
import JobNoteForm from "./JobNoteForm";
import TasksTable from "./TasksTable";
import JobsTable from "./JobsTable";
import useProjectQuery from "@/queries/useProjectQuery";
import useJobQuery from "@/queries/useJobQuery";
import PageHeader from "@/components/PageHeader";
import useJobNotesQuery from "@/queries/useJobNotesQuery";
import PageLoading from "@/components/PageLoading";
import ItemsContainer from "@/components/ItemsContainer";
import useNotFound from "@/hook/useNotFound";
import JobStatus from "@/components/JobStatus";
import CollapsibleSection from "@/components/CollapsibleSection";

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
  const { data: session } = useSession();

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
    <div className="flex flex-col gap-4">
      <PageHeader
        items={[
          { href: "/workspace", name: "Workspace" },
          { href: `/workspace/jobs/${job.id}`, name: job.jobName },
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
          <JobStatus
            job={job}
            readOnly={
              !job.assignedTasks.some(
                (value) => value.assigneeId === session?.id
              )
            }
            project={project}
          />
        </CollapsibleSection>
        <CollapsibleSection title="Tasks">
          <TasksTable job={job} project={project} />
        </CollapsibleSection>
      </div>
    </div>
  );
}
