"use client";
import ProjectForm from "./ProjectForm";
import PageHeaderAction from "./PageHeaderAction";
import JobsTable from "./JobsTable";
import useProjectQuery from "@/queries/useProjectQuery";
import PageHeader from "@/components/PageHeader";
import PageLoading from "@/components/PageLoading";
import useNotFound from "@/hook/useNotFound";
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
  useNotFound(projectQueryError);

  if (isProjectQueryLoading || project == null) {
    return <PageLoading />;
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        items={[
          { href: "/workspace", name: "Workspace" },
          {
            href: `/workspace/projects/${project.projectId}`,
            name: project.propertyAddress.fullAddress,
          },
        ]}
        action={<PageHeaderAction project={project} />}
      />
      <div className="space-y-6">
        <section>
          <ProjectForm project={project} />
        </section>
        <CollapsibleSection title="Jobs Related to Project">
          <JobsTable project={project} />
        </CollapsibleSection>
      </div>
    </div>
  );
}