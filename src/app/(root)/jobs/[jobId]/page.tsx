"use client";
import React from "react";
import PageHeader from "@/components/PageHeader";
import PageLoading from "@/components/PageLoading";
import useJobQuery from "@/queries/useJobQuery";

interface Props {
  params: {
    jobId: string;
  };
}

export default function Page({ params: { jobId } }: Props) {
  const { data: job, isLoading: isJobQueryLoading } = useJobQuery(jobId);

  if (isJobQueryLoading || job == null) {
    return <PageLoading />;
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        items={[
          { href: "/", name: "Home" },
          { href: `/jobs/${job.id}`, name: job.jobName },
        ]}
      />
      🚧 TODO: Job Detail Page for Client 🚧
    </div>
  );
}
