"use client";
import PageHeader from "@/components/PageHeader";
import PageLoading from "@/components/PageLoading";
import useNotFound from "@/hook/useNotFound";
import UtilityNotesForm from "@/components/utility-notes/UtilityNotesForm";
import UtilityNoteHistories from "@/components/utility-notes/UtilityNoteHistories";
import useProjectQuery from "@/queries/useProjectQuery";
import CollapsibleSection from "@/components/CollapsibleSection";
import useUtilityQuery from "@/queries/useUtilityQuery";
import useJobQuery from "@/queries/useJobQuery";

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
  const {
    data: project,
    isLoading: isProjectQueryLoading,
    error: projectQueryError,
  } = useProjectQuery(job?.projectId ?? "");
  const {
    data: utility,
    isLoading: isUtilityQueryLoading,
    error: utilityQueryError,
  } = useUtilityQuery(project?.utilityId ?? "");
  useNotFound(jobQueryError);
  useNotFound(projectQueryError);
  useNotFound(utilityQueryError);

  if (
    isJobQueryLoading ||
    job == null ||
    isProjectQueryLoading ||
    project == null ||
    isUtilityQueryLoading ||
    utility == null
  ) {
    return <PageLoading />;
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        items={[
          { href: "/system-management/jobs", name: "Jobs" },
          { href: `/system-management/jobs/${job.id}`, name: job.jobName },
          {
            href: `/system-management/jobs/${job.id}/utility-notes`,
            name: "Utility Notes",
          },
        ]}
      />
      <div className="space-y-6">
        <section>
          <UtilityNotesForm utility={utility} />
        </section>
        <CollapsibleSection title="History">
          <UtilityNoteHistories utilityId={utility.id} />
        </CollapsibleSection>
      </div>
    </div>
  );
}
