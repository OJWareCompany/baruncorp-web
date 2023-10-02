"use client";
import React, { useEffect, useState } from "react";
import {
  AhjNoteResponseDto,
} from "@/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useProjectQuery from "@/queries/useProjectQuery";
import useApi from "@/hook/useApi";
import useJobQuery from "@/queries/useJobQuery";
import PageHeader from "@/components/PageHeader";
import PageLoading from "@/components/PageLoading";
import { transformProjectAssociatedRegulatoryBodyIntoArray } from "@/lib/ahj";
import AhjNote from "@/components/ahj/AhjNote";

const title = "AHJ Note";

interface Props {
  params: {
    jobId: string;
  };
}

export default function Page({ params: { jobId } }: Props) {
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
  const { data: job, isLoading: isJobQueryLoading } = useJobQuery({
    jobId,
  });
  const projectId = job?.projectId ?? "";
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

  if (isJobQueryLoading || isProjectQueryLoading || ahjState.isLoading) {
    return <PageLoading />;
  }

  return (
    <div className="flex flex-col">
      <PageHeader
        items={[
          { href: "/system-management/jobs", name: "Jobs" },
          {
            href: `/system-management/jobs/${job?.id}`,
            name: job?.jobName ?? "",
          },
          { href: `/system-management/jobs/${job?.id}/ahj`, name: title },
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
