"use client";
import PageHeader from "@/components/PageHeader";
import PageLoading from "@/components/PageLoading";
import useNotFound from "@/hook/useNotFound";
import useClientNoteHistoriesQuery from "@/queries/useClientNoteHistoriesQuery";
import useClientNoteQuery from "@/queries/useClientNoteQuery";
import ClientNotesForm from "@/components/client-notes/ClientNotesForm";
import ClientNoteHistories from "@/components/client-notes/ClientNoteHistories";
import useProjectQuery from "@/queries/useProjectQuery";
import CollapsibleSection from "@/components/CollapsibleSection";
import { ProjectResponseDto } from "@/api/api-spec";

function getPageHeader({
  pageType,
  project,
}: {
  pageType: PageType;
  project: ProjectResponseDto;
}) {
  switch (pageType) {
    case "HOME":
      return (
        <PageHeader
          items={[
            { href: "/", name: "Home" },
            {
              href: `/projects/${project.projectId}`,
              name: project.propertyAddress.fullAddress,
            },
            {
              href: `/projects/${project.projectId}/client-notes`,
              name: "Client Notes",
            },
          ]}
        />
      );
    case "WORKSPACE":
      return (
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
      );
    case "SYSTEM_MANAGEMENT":
      return (
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
      );
  }
}

interface Props {
  projectId: string;
  pageType: PageType;
}

export default function ClientNotesPage({ projectId, pageType }: Props) {
  const {
    data: project,
    isLoading: isProjectQueryLoading,
    error: projectQueryError,
  } = useProjectQuery(projectId);
  const {
    data: clientNoteHistories,
    isLoading: isClientNoteHistoriesQueryLoading,
    error: clientNoteHistoriesQueryError,
  } = useClientNoteHistoriesQuery({
    organizationId: project?.clientOrganizationId,
  });
  const {
    data: clientNote,
    isLoading: isClientNoteQueryLoading,
    error: clientNoteQueryError,
  } = useClientNoteQuery(clientNoteHistories?.items[0].id ?? "", true);
  useNotFound(projectQueryError);
  useNotFound(clientNoteHistoriesQueryError);
  useNotFound(clientNoteQueryError);

  if (
    isProjectQueryLoading ||
    project == null ||
    isClientNoteHistoriesQueryLoading ||
    clientNoteHistories == null ||
    isClientNoteQueryLoading ||
    clientNote == null
  ) {
    return <PageLoading />;
  }

  const organizationId = project.clientOrganizationId;

  return (
    <div className="flex flex-col gap-4">
      {getPageHeader({ pageType, project })}
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
