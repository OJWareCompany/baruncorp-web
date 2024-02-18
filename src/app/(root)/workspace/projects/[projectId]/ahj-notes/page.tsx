import AhjNotesPage from "@/components/project-detail-page/ahj-notes-page/AhjNotesPage";

interface Props {
  params: {
    projectId: string;
  };
}

export default function Page({ params: { projectId } }: Props) {
  return <AhjNotesPage projectId={projectId} pageType="WORKSPACE" />;
}
