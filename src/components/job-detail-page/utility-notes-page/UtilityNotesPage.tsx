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
import { JobResponseDto } from "@/api/api-spec";

function getPageHeader({
  pageType,
  job,
}: {
  pageType: JobDetailPageType;
  job: JobResponseDto;
}) {
  switch (pageType) {
    case "HOME":
      return (
        <PageHeader
          items={[
            { href: "/", name: "Home" },
            { href: `/jobs/${job.id}`, name: job.jobName },
            { href: `/jobs/${job.id}/utility-notes`, name: "Utility Notes" },
          ]}
        />
      );
    case "WORKSPACE":
      return (
        <PageHeader
          items={[
            { href: "/workspace", name: "Workspace" },
            { href: `/workspace/jobs/${job.id}`, name: job.jobName },
            {
              href: `/workspace/jobs/${job.id}/utility-notes`,
              name: "Utility Notes",
            },
          ]}
        />
      );
    case "SYSTEM_MANAGEMENT":
      return (
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
      );
  }
}

interface Props {
  jobId: string;
  pageType: JobDetailPageType;
}

export default function UtilityNotesPage({ jobId, pageType }: Props) {
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
      {getPageHeader({ job, pageType })}
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
