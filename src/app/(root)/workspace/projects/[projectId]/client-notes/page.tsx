"use client";
import PageHeader from "@/components/PageHeader";
import PageLoading from "@/components/PageLoading";
import useNotFound from "@/hook/useNotFound";
import useClientNotesQuery from "@/queries/useClientNotesQuery";
import useClientNoteQuery from "@/queries/useClientNoteQuery";
import ClientNotesForm from "@/components/client-notes/ClientNotesForm";
import ClientNoteHistories from "@/components/client-notes/ClientNoteHistories";
import useProjectQuery from "@/queries/useProjectQuery";
import CollapsibleSection from "@/components/CollapsibleSection";

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
          { href: "/workspace", name: "Workspace" },
          {
            href: `/workspace/projects/${project.projectId}`,
            name: project.propertyAddress.fullAddress,
          },
          {
            href: `/workspace/projects/${project.projectId}/client-notes`,
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
