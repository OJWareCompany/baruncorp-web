"use client";
import ProjectForm from "./ProjectForm";
import PageHeaderAction from "./PageHeaderAction";
import JobsTable from "./JobsTable";
import useProjectQuery from "@/queries/useProjectQuery";
import PageHeader from "@/components/PageHeader";
import PageLoading from "@/components/PageLoading";
import useNotFound from "@/hook/useNotFound";

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
          { href: "/system-management/projects", name: "Projects" },
          {
            href: `/system-management/projects/${project?.projectId}`,
            name: project.propertyAddress.fullAddress,
          },
        ]}
        action={<PageHeaderAction project={project} />}
      />
      <div className="space-y-6">
        <section>
          <ProjectForm project={project} />
        </section>
        <section>
          <h4 className="h4 mb-2">Jobs Related to Project</h4>
          <JobsTable project={project} />
        </section>
      </div>
    </div>
  );
}
