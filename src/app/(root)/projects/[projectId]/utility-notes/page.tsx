import UtilityNotesPage from "@/components/project-detail-page/utility-notes-page/UtilityNotesPage";

interface Props {
  params: {
    projectId: string;
  };
}

export default function Page({ params: { projectId } }: Props) {
  return <UtilityNotesPage projectId={projectId} pageType="HOME" />;
}
