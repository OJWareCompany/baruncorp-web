"use client";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import useProjectQuery from "@/queries/useProjectQuery";
import PageHeader from "@/components/PageHeader";
import PageLoading from "@/components/PageLoading";
import { transformProjectAssociatedRegulatoryBodyIntoArray } from "@/lib/ahj";
import useApi from "@/hook/useApi";
import { AhjNoteResponseDto } from "@/api/api-spec";
import AhjTabs from "@/components/tab/AhjTabs";
import useNotFound from "@/hook/useNotFound";

interface Props {
  params: {
    projectId: string;
  };
}

export default function Page({ params: { projectId } }: Props) {
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
      <PageHeader
        items={[
          { href: "/system-management/projects", name: "Projects" },
          {
            href: `/system-management/projects/${project.projectId}`,
            name: project.propertyAddress.fullAddress ?? "",
          },
          {
            href: `/system-management/projects/${project.projectId}/ahj-notes`,
            name: "AHJ Notes",
          },
        ]}
      />
      <AhjTabs project={project} />
    </div>
  );
}
