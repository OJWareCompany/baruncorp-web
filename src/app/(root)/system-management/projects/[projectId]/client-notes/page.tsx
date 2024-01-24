"use client";
import PageHeader from "@/components/PageHeader";
import PageLoading from "@/components/PageLoading";
import useNotFound from "@/hook/useNotFound";
import useClientNotesQuery from "@/queries/useClientNotesQuery";
import useClientNoteQuery from "@/queries/useClientNoteQuery";
import ClientNotesForm from "@/components/client-notes/ClientNotesForm";
import ClientNoteHistories from "@/components/client-notes/ClientNoteHistories";
import useProjectQuery from "@/queries/useProjectQuery";

interface Props {
  params: {
    projectId: string;
  };
}

export default function Page({ params: { projectId } }: Props) {
  const {
    data: project,
    isLoading: isProjectQueryLoading,
    error: projectQueryError,
  } = useProjectQuery(projectId);
  const {
    data: clientNotes,
    isLoading: isClientNotesQueryLoading,
    error: clientNotesQueryError,
  } = useClientNotesQuery({
    organizationId: project?.clientOrganizationId,
  });
  const {
    data: clientNote,
    isLoading: isClientNoteQueryLoading,
    error: clientNoteQueryError,
  } = useClientNoteQuery(clientNotes?.items[0].id ?? "", true);
  useNotFound(projectQueryError);
  useNotFound(clientNotesQueryError);
  useNotFound(clientNoteQueryError);

  if (
    isProjectQueryLoading ||
    project == null ||
    isClientNotesQueryLoading ||
    clientNotes == null ||
    isClientNoteQueryLoading ||
    clientNote == null
  ) {
    return <PageLoading />;
  }

  const organizationId = project.clientOrganizationId;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        items={[
          { href: "/system-management/projects", name: "Projects" },
          {
            href: `/system-management/projects/${project.projectId}`,
            name: project.propertyAddress.fullAddress,
          },
          {
            href: `/system-management/projects/${project.projectId}/client-notes`,
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
