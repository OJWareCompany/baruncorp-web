"use client";
import React, { useEffect, useState } from "react";
import {
  AhjNoteResponseDto,
} from "@/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useProjectQuery from "@/queries/useProjectQuery";
import useApi from "@/hook/useApi";
import PageHeader from "@/components/PageHeader";
import { transformProjectAssociatedRegulatoryBodyIntoArray } from "@/lib/ahj";
import PageLoading from "@/components/PageLoading";
import AhjNote from "@/components/ahj/AhjNote";

const title = "AHJ Note";

interface Props {
  params: {
    projectId: string;
  };
}

export default function Page({ params: { projectId } }: Props) {
  const api = useApi();

  /**
   * State
   */
  const [selectedTab, setSelectedTab] = useState<string>();
  const [ahjState, setAhjState] = useState<{
    isLoading: boolean;
    items: {
      type: string;
      name: string;
      geoId: string;
      note: AhjNoteResponseDto;
    }[];
  }>({ isLoading: true, items: [] });

  /**
   * Query
   */
  const { data: project, isLoading: isProjectQueryLoading } = useProjectQuery({
    projectId,
  });

  useEffect(() => {
    if (project) {
      const projectAssociatedRegulatoryBodyArray =
        transformProjectAssociatedRegulatoryBodyIntoArray(
          project.projectAssociatedRegulatoryBody
        );

      Promise.all(
        projectAssociatedRegulatoryBodyArray.map(async (value) => {
          const { data: ahjNote } =
            await api.geography.geographyControllerGetFindNoteByGeoId(
              value.geoId
            );

          return {
            ...value,
            note: ahjNote,
          };
        })
      ).then((value) => {
        setSelectedTab(value[0].type);
        setAhjState({
          isLoading: false,
          items: value,
        });
      });
    }
  }, [api.geography, project]);

  if (isProjectQueryLoading || ahjState.isLoading) {
    return <PageLoading />;
  }

  return (
    <div className="flex flex-col">
      <PageHeader
        items={[
          { href: "/system-management/projects", name: "Projects" },
          {
            href: `/system-management/projects/${project?.projectId}`,
            name: project?.propertyAddress.fullAddress ?? "",
          },
          {
            href: `/system-management/projects/${project?.projectId}/ahj`,
            name: title,
          },
        ]}
        title={title}
      />
      <Tabs
        value={selectedTab}
        onValueChange={(newValue) => {
          setSelectedTab(newValue);
        }}
      >
        <TabsList>
          {ahjState.items.map((ahj) => (
            <TabsTrigger key={ahj.type} value={ahj.type}>
              {ahj.name}
            </TabsTrigger>
          ))}
        </TabsList>
        {ahjState.items.map((ahj) => (
          <TabsContent key={ahj.type} value={ahj.type} className="mt-4">
            <AhjNote geoId={ahj.geoId} initialAhjNote={ahj.note} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
