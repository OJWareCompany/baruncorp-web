"use client";
import useJobQuery from "@/queries/useJobQuery";
import PageHeader from "@/components/PageHeader";
import PageLoading from "@/components/PageLoading";
import useNotFound from "@/hook/useNotFound";
import useClientNotesQuery from "@/queries/useClientNotesQuery";
import useClientNoteQuery from "@/queries/useClientNoteQuery";
import ClientNotesForm from "@/components/client-notes/ClientNotesForm";
import ClientNoteHistories from "@/components/client-notes/ClientNoteHistories";

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
    data: clientNotes,
    isLoading: isClientNotesQueryLoading,
    error: clientNotesQueryError,
  } = useClientNotesQuery({
    organizationId: job?.clientInfo.clientOrganizationId,
  });
  const {
    data: clientNote,
    isLoading: isClientNoteQueryLoading,
    error: clientNoteQueryError,
  } = useClientNoteQuery(clientNotes?.items[0].id ?? "", true);
  useNotFound(jobQueryError);
  useNotFound(clientNotesQueryError);
  useNotFound(clientNoteQueryError);

  if (
    isJobQueryLoading ||
    job == null ||
    isClientNotesQueryLoading ||
    clientNotes == null ||
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
          { href: "/system-management/jobs", name: "Jobs" },
          { href: `/system-management/jobs/${job.id}`, name: job.jobName },
          {
            href: `/system-management/jobs/${job.id}/client-notes`,
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
        <section>
          <h2 className="h4 mb-2">History</h2>
          <ClientNoteHistories organizationId={organizationId} />
        </section>
      </div>
    </div>
  );
}
