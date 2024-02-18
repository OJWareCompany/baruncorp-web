import ClientNotesPage from "@/components/project-detail-page/client-notes-page/ClientNotesPage";

interface Props {
  params: {
    projectId: string;
  };
}

export default function Page({ params: { projectId } }: Props) {
  return <ClientNotesPage projectId={projectId} pageType="HOME" />;
}
