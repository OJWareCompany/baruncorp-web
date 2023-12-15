"use client";
import React, { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AhjNoteResponseDto } from "@/api";
import useProjectQuery from "@/queries/useProjectQuery";
import useApi from "@/hook/useApi";
import useJobQuery from "@/queries/useJobQuery";
import PageHeader from "@/components/PageHeader";
import PageLoading from "@/components/PageLoading";
import { transformProjectAssociatedRegulatoryBodyIntoArray } from "@/lib/ahj";
import AhjTabs from "@/components/tab/AhjTabs";

interface Props {
  params: {
    jobId: string;
  };
}

export default function Page({ params: { jobId } }: Props) {
  const api = useApi();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(true);
  const { data: job, isLoading: isJobQueryLoading } = useJobQuery(jobId);
  const projectId = job?.projectId ?? "";
  const { data: project, isLoading: isProjectQueryLoading } =
    useProjectQuery(projectId);

  useEffect(() => {
    if (project) {
      const projectAssociatedRegulatoryBodyArray =
        transformProjectAssociatedRegulatoryBodyIntoArray(
          project.projectAssociatedRegulatoryBody
        );

      Promise.all(
        projectAssociatedRegulatoryBodyArray.map(async (value) => {
          const queryKey = ["ahj-notes", "detail", { geoId: value.geoId }];
          const queryData =
            queryClient.getQueryData<AhjNoteResponseDto>(queryKey);
          if (queryData != null) {
            return;
          }

          const { data: ahjNote } =
            await api.geography.geographyControllerGetFindNoteByGeoId(
              value.geoId
            );

          queryClient.setQueryData(queryKey, ahjNote);
        })
      ).finally(() => {
        setIsLoading(false);
      });
    }
  }, [api.geography, project, queryClient]);

  if (
    isJobQueryLoading ||
    job == null ||
    isProjectQueryLoading ||
    project == null ||
    isLoading
  ) {
    return <PageLoading />;
  }

  return (
    <div className="flex flex-col">
      <PageHeader
        items={[
          { href: "/system-management/jobs", name: "Jobs" },
          {
            href: `/system-management/jobs/${job.id}`,
            name: job.jobName ?? "",
          },
          { href: `/system-management/jobs/${job.id}/ahj`, name: "AHJ Note" },
        ]}
      />
      <AhjTabs project={project} />
    </div>
  );
}
