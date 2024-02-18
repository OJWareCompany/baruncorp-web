import UtilityNotesPage from "@/components/job-detail-page/utility-notes-page/UtilityNotesPage";

interface Props {
  params: {
    jobId: string;
  };
}

export default function Page({ params: { jobId } }: Props) {
  return <UtilityNotesPage jobId={jobId} pageType="WORKSPACE" />;
}
