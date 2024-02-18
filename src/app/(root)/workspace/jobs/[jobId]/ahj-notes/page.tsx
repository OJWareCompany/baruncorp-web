import AhjNotesPage from "@/components/job-detail-page/ahj-notes-page/AhjNotesPage";

interface Props {
  params: {
    jobId: string;
  };
}

export default function Page({ params: { jobId } }: Props) {
  return <AhjNotesPage jobId={jobId} pageType="WORKSPACE" />;
}
