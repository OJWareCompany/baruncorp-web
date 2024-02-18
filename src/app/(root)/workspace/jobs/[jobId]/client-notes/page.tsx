import ClientNotesPage from "@/components/job-detail-page/client-notes-page/ClientNotesPage";

interface Props {
  params: {
    jobId: string;
  };
}

export default function Page({ params: { jobId } }: Props) {
  return <ClientNotesPage jobId={jobId} pageType="WORKSPACE" />;
}
