"use client";
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
          { href: "/system-management/jobs", name: "Jobs" },
          { href: `/system-management/jobs/${job.id}`, name: job.jobName },
        ]}
        action={<PageHeaderAction job={job} project={project} />}
      />
      <div className="space-y-6">
        <ProjectSection project={project} />
        <section>
          <h4 className="h4 mb-2">Jobs Related to Project</h4>
          <JobsTable project={project} />
        </section>
        <section>
          <h4 className="h4 mb-2">Job</h4>
          <JobForm job={job} project={project} />
        </section>
        <section>
          <h4 className="h4 mb-2">Job Note</h4>
          <ItemsContainer>
            <JobNotesTable jobNotes={jobNotes} />
            <JobNoteForm job={job} />
          </ItemsContainer>
        </section>
        <section>
          <h4 className="h4 mb-2">Status</h4>
          <JobStatus job={job} project={project} />
        </section>
        <section>
          <h4 className="h4 mb-2">Tasks</h4>
          <TasksTable job={job} project={project} />
        </section>
      </div>
    </div>
  );
}
