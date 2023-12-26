"use client";
import React from "react";
import PageHeader from "@/components/PageHeader";
import PageLoading from "@/components/PageLoading";
import useJobQuery from "@/queries/useJobQuery";
import useNotFound from "@/hook/useNotFound";

interface Props {
  params: {
    jobId: string;
  };
}

export default function Page({ params: { jobId } }: Props) {
  const {
    data: job,
    isLoading: isJobQueryLoading,
    error: jobQueryError,
  } = useJobQuery(jobId);
  useNotFound(jobQueryError);

  if (isJobQueryLoading || job == null) {
    return <PageLoading />;
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        items={[
          { href: "/workspace", name: "Workspace" },
          { href: `/workspace/jobs/${job.id}`, name: job.jobName },
        ]}
      />
      🚧 TODO: Job Detail Page for Worker 🚧
    </div>
  );
}