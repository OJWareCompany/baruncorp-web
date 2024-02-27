"use client";
import PageHeader from "@/components/PageHeader";
import PageLoading from "@/components/PageLoading";
import useNotFound from "@/hook/useNotFound";
import UtilityNotesForm from "@/components/utility-notes/UtilityNotesForm";
import UtilityNoteHistories from "@/components/utility-notes/UtilityNoteHistories";
import useProjectQuery from "@/queries/useProjectQuery";
import CollapsibleSection from "@/components/CollapsibleSection";
import useUtilityQuery from "@/queries/useUtilityQuery";
import { ProjectResponseDto } from "@/api/api-spec";

function getPageHeader({
  pageType,
  project,
}: {
  pageType: JobDetailPageType;
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
              href: `/projects/${project.projectId}/utility-notes`,
              name: "Utility Notes",
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
              href: `/workspace/projects/${project.projectId}/utility-notes`,
              name: "Utility Notes",
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
              href: `/system-management/projects/${project.projectId}/utility-notes`,
              name: "Utility Notes",
            },
          ]}
        />
      );
  }
}

interface Props {
  projectId: string;
  pageType: JobDetailPageType;
}

export default function UtilityNotesPage({ projectId, pageType }: Props) {
  const {
    data: project,
    isLoading: isProjectQueryLoading,
    error: projectQueryError,
  } = useProjectQuery(projectId);
  const {
    data: utility,
    isLoading: isUtilityQueryLoading,
    error: utilityQueryError,
  } = useUtilityQuery(project?.utilityId ?? "");
  useNotFound(utilityQueryError);
  useNotFound(projectQueryError);

  if (
    isProjectQueryLoading ||
    project == null ||
    isUtilityQueryLoading ||
    utility == null
  ) {
    return <PageLoading />;
  }

  return (
    <div className="flex flex-col gap-4">
      {getPageHeader({ pageType, project })}
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
