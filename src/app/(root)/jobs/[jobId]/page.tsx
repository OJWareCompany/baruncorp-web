"use client";
import ProjectSection from "./ProjectSection";
// import JobForm from "./JobForm";
// import JobNotesTable from "./JobNoteTable";
// import JobNoteForm from "./JobNoteForm";
// import TasksTable from "./TasksTable";
// import JobsTable from "./JobsTable";
import JobsTable from "./JobsTable";
import JobForm from "./JobForm";
import useProjectQuery from "@/queries/useProjectQuery";
import useJobQuery from "@/queries/useJobQuery";
import PageHeader from "@/components/PageHeader";
import useJobNotesQuery from "@/queries/useJobNotesQuery";
import PageLoading from "@/components/PageLoading";
import useNotFound from "@/hook/useNotFound";
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
          { href: "/", name: "Home" },
          { href: `/jobs/${job.id}`, name: job.jobName },
        ]}
      />
      <div className="space-y-6">
        <ProjectSection project={project} />
        <CollapsibleSection title="Jobs Related to Project">
          <JobsTable project={project} />
        </CollapsibleSection>
        <CollapsibleSection title="Job">
          <JobForm job={job} project={project} />
        </CollapsibleSection>
      </div>
    </div>
  );
}
