"use client";
import useJobQuery from "@/queries/useJobQuery";
import PageHeader from "@/components/PageHeader";
import PageLoading from "@/components/PageLoading";
import useNotFound from "@/hook/useNotFound";
import useClientNoteHistoriesQuery from "@/queries/useClientNoteHistoriesQuery";
import useClientNoteQuery from "@/queries/useClientNoteQuery";
import ClientNotesForm from "@/components/client-notes/ClientNotesForm";
import ClientNoteHistories from "@/components/client-notes/ClientNoteHistories";
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
  const {
    data: clientNoteHistories,
    isLoading: isClientNoteHistoriesQueryLoading,
    error: clientNoteHistoriesQueryError,
  } = useClientNoteHistoriesQuery({
    organizationId: job?.clientInfo.clientOrganizationId,
  });
  const {
    data: clientNote,
    isLoading: isClientNoteQueryLoading,
    error: clientNoteQueryError,
  } = useClientNoteQuery(clientNoteHistories?.items[0].id ?? "", true);
  useNotFound(jobQueryError);
  useNotFound(clientNoteHistoriesQueryError);
  useNotFound(clientNoteQueryError);

  if (
    isJobQueryLoading ||
    job == null ||
    isClientNoteHistoriesQueryLoading ||
    clientNoteHistories == null ||
    isClientNoteQueryLoading ||
    clientNote == null
  ) {
    return <PageLoading />;
  }

  const organizationId = job.clientInfo.clientOrganizationId;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        items={[
          { href: "/workspace", name: "Workspace" },
          { href: `/workspace/jobs/${job.id}`, name: job.jobName },
          {
            href: `/workspace/jobs/${job.id}/client-notes`,
            name: "Client Notes",
          },
        ]}
      />
      <div className="space-y-6">
        <section>
          <ClientNotesForm
            clientNote={clientNote}
            organizationId={organizationId}
          />
        </section>
        <CollapsibleSection title="History">
          <ClientNoteHistories organizationId={organizationId} />
        </CollapsibleSection>
      </div>
    </div>
  );
}
