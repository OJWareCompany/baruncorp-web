"use client";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import useProjectQuery from "@/queries/useProjectQuery";
import PageHeader from "@/components/PageHeader";
import PageLoading from "@/components/PageLoading";
import { transformProjectAssociatedRegulatoryBodyIntoArray } from "@/lib/ahj";
import useApi from "@/hook/useApi";
import { AhjNoteResponseDto, ProjectResponseDto } from "@/api/api-spec";
import AhjTabs from "@/components/tab/AhjTabs";
import useNotFound from "@/hook/useNotFound";

function getPageHeader({
  pageType,
  project,
}: {
  pageType: JobDetailPageType;
  project: ProjectResponseDto;
}) {
  switch (pageType) {
    case "HOME":
      return (
        <PageHeader
          items={[
            { href: "/", name: "Home" },
            {
              href: `/projects/${project.projectId}`,
              name: project.propertyAddress.fullAddress,
            },
            {
              href: `/projects/${project.projectId}/ahj-notes`,
              name: "AHJ Notes",
            },
          ]}
        />
      );
    case "WORKSPACE":
      return (
        <PageHeader
          items={[
            { href: "/workspace", name: "Workspace" },
            {
              href: `/workspace/projects/${project.projectId}`,
              name: project.propertyAddress.fullAddress,
            },
            {
              href: `/workspace/projects/${project.projectId}/ahj-notes`,
              name: "AHJ Notes",
            },
          ]}
        />
      );
    case "SYSTEM_MANAGEMENT":
      return (
        <PageHeader
          items={[
            { href: "/system-management/projects", name: "Projects" },
            {
              href: `/system-management/projects/${project.projectId}`,
              name: project.propertyAddress.fullAddress,
            },
            {
              href: `/system-management/projects/${project.projectId}/ahj-notes`,
              name: "AHJ Notes",
            },
          ]}
        />
      );
  }
}

interface Props {
  projectId: string;
  pageType: JobDetailPageType;
}

export default function AhjNotesPage({ projectId, pageType }: Props) {
  const api = useApi();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(true);
  const {
    data: project,
    isLoading: isProjectQueryLoading,
    error: projectQueryError,
  } = useProjectQuery(projectId);
  useNotFound(projectQueryError);

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

  if (isProjectQueryLoading || project == null || isLoading) {
    return <PageLoading />;
  }

  return (
    <div className="flex flex-col">
      {getPageHeader({ pageType, project })}
      <AhjTabs project={project} />
    </div>
  );
}
