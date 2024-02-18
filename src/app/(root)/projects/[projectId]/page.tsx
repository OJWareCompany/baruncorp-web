import ProjectDetailPage from "@/components/project-detail-page/ProjectDetailPage";

interface Props {
  params: {
    projectId: string;
  };
}

export default function Page({ params: { projectId } }: Props) {
  return <ProjectDetailPage projectId={projectId} pageType="HOME" />;
}
