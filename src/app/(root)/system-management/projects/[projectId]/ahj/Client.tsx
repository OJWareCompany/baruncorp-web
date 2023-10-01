"use client";

import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import AhjNote from "./AhjNote";

import {
  AhjNoteResponseDto,
  ProjectAssociatedRegulatoryBodyDto,
  ProjectResponseDto,
} from "@/api";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useProjectQuery from "@/queries/useProjectQuery";
import useApi from "@/hook/useApi";
import PageHeader from "@/components/PageHeader";

type ProjectAssociatedRegulatoryBodyArray = {
  type: string;
  name: string;
  geoId: string;
}[];

function transformProjectAssociatedRegulatoryBodyIntoArray(
  projectAssociatedRegulatoryBody: ProjectAssociatedRegulatoryBodyDto
): ProjectAssociatedRegulatoryBodyArray {
  if (projectAssociatedRegulatoryBody == null) {
    return [];
  }

  const array: ProjectAssociatedRegulatoryBodyArray = [];

  if (projectAssociatedRegulatoryBody.placeId != null) {
    array.push({
      type: "place",
      name: "Place",
      geoId: projectAssociatedRegulatoryBody.placeId,
    });
  }
  if (projectAssociatedRegulatoryBody.countySubdivisionsId != null) {
    array.push({
      type: "countySubdivision",
      name: "County Subdivision",
      geoId: projectAssociatedRegulatoryBody.countySubdivisionsId,
    });
  }
  if (projectAssociatedRegulatoryBody.countyId != null) {
    array.push({
      type: "county",
      name: "County",
      geoId: projectAssociatedRegulatoryBody.countyId,
    });
  }
  if (projectAssociatedRegulatoryBody.stateId != null) {
    array.push({
      type: "state",
      name: "State",
      geoId: projectAssociatedRegulatoryBody.stateId,
    });
  }

  return array;
}

interface Props {
  initialProject: ProjectResponseDto | null;
}

export default function Client({ initialProject }: Props) {
  /**
   * State
   */
  const [selectedTab, setSelectedTab] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);
  const [ahjs, setAhjs] = useState<
    { type: string; name: string; geoId: string; note: AhjNoteResponseDto }[]
  >([]);

  /**
   * Query
   */
  const projectId = initialProject?.projectId ?? "";
  const { data: project } = useProjectQuery({
    projectId,
    initialData: initialProject,
  });

  const api = useApi();

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
        setAhjs(value);
        setIsLoading(false);
      });
    }
  }, [api.geography, project]);

  const title = "AHJ Note";

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
      {isLoading ? (
        <div className="flex justify-center">
          <Loader2 className="w-[40px] h-[40px] animate-spin" />
        </div>
      ) : (
        <Tabs
          value={selectedTab}
          onValueChange={(newValue) => {
            setSelectedTab(newValue);
          }}
        >
          <TabsList>
            {ahjs.map((ahj) => (
              <TabsTrigger key={ahj.type} value={ahj.type}>
                {ahj.name}
              </TabsTrigger>
            ))}
          </TabsList>
          {ahjs.map((ahj) => (
            <TabsContent key={ahj.type} value={ahj.type} className="mt-4">
              <AhjNote geoId={ahj.geoId} initialAhjNote={ahj.note} />
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}
