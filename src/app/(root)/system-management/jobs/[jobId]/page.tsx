import JobDetailPage from "@/components/job-detail-page/JobDetailPage";

interface Props {
  params: {
    jobId: string;
  };
}

export default function Page({ params: { jobId } }: Props) {
  return <JobDetailPage jobId={jobId} pageType="SYSTEM_MANAGEMENT" />;
}
