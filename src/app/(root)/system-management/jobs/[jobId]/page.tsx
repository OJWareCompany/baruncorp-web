"use client";
import PageHeaderAction from "./PageHeaderAction";
import ProjectSection from "./ProjectSection";
import JobForm from "./JobForm";
import JobNotesTable from "./JobNoteTable";
import JobNoteForm from "./JobNoteForm";
import TasksTable from "./TasksTable";
import JobsTable from "./JobsTable";
import JobStatus from "./JobStatus";
import useProjectQuery from "@/queries/useProjectQuery";
import useJobQuery from "@/queries/useJobQuery";
import PageHeader from "@/components/PageHeader";
import useJobNotesQuery from "@/queries/useJobNotesQuery";
import PageLoading from "@/components/PageLoading";
import ItemsContainer from "@/components/ItemsContainer";
import useNotFound from "@/hook/useNotFound";

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

  // const { mutateAsync: patchJobCancelMutateAsync } =
  //   usePatchJobCancelMutation(jobId);
  // const { mutateAsync: patchJobHoldMutateAsync } =
  //   usePatchJobHoldMutation(jobId);

  // const status = statuses.find((value) => value.value === job?.jobStatus);

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
        action={<PageHeaderAction job={job} />}
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
          <JobStatus job={job} />
        </section>
        <section>
          <h4 className="h4 mb-2">Tasks</h4>
          <TasksTable job={job} project={project} />
        </section>
        {/* 
        <section>
          <h4 className="h4 mb-2">Job Status</h4>
          <div className="flex flex-col gap-2">
            <div className="flex h-10 px-3 py-2 rounded-md text-sm border border-input bg-background">
              {status && (
                <div className="flex items-center flex-1 gap-2">
                  <status.Icon className={`w-4 h-4 ${status.color}`} />
                  <span>{status.value}</span>
                </div>
              )}
            </div>
            <RowItemsContainer className="space-x-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant={"outline"}
                    disabled={
                      job?.jobStatus === "Completed" ||
                      job?.jobStatus === "On Hold"
                    }
                  >
                    Hold
                  </Button>
                </AlertDialogTrigger>
                <CommonAlertDialogContent
                  onContinue={() => {
                    patchJobHoldMutateAsync()
                      .then(() => {
                        queryClient.invalidateQueries({
                          queryKey: ["jobs", "detail", { jobId }],
                        });
                        queryClient.invalidateQueries({
                          queryKey: ["projects", "detail", { projectId }],
                        });
                      })
                      .catch(() => {});
                  }}
                />
              </AlertDialog>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant={"outline"}
                    disabled={
                      job?.jobStatus === "Completed" ||
                      job?.jobStatus === "Canceled"
                    }
                    className="text-destructive hover:text-destructive"
                  >
                    Cancel
                  </Button>
                </AlertDialogTrigger>
                <CommonAlertDialogContent
                  onContinue={() => {
                    patchJobCancelMutateAsync()
                      .then(() => {
                        queryClient.invalidateQueries({
                          queryKey: ["jobs", "detail", { jobId }],
                        });
                        queryClient.invalidateQueries({
                          queryKey: ["projects", "detail", { projectId }],
                        });
                      })
                      .catch(() => {});
                  }}
                />
              </AlertDialog>
            </RowItemsContainer>
          </div>
        </section>
        <section>
          <h4 className="h4 mb-2">Tasks</h4>
          <OrderedServicesTable
          // assignedTasks={job?.assignedTasks ?? []}
          // orderedServices={job?.orderedServices ?? []}
          // jobId={jobId}
          // projectId={projectId}
          />
        </section> */}
      </div>
    </div>
  );
}
