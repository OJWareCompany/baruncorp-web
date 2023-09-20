"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import AhjNote from "./components/AhjNote";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from "@/components/ui/breadcrumb";
import {
  AhjNoteResponseDto,
  ProjectAssociatedRegulatoryBodyDto,
  ProjectResponseDto,
} from "@/api";




import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useProjectQuery from "@/queries/useProjectQuery";
import useApi from "@/hook/useApi";

interface PageHeaderProps {
  project: ProjectResponseDto | undefined;
}

function PageHeader({ project }: PageHeaderProps) {
  if (project == null) {
    return null;
  }

  const { projectId, propertyAddress } = project;

  if (propertyAddress == null) {
    return null;
  }

  const { fullAddress } = propertyAddress;
  const title = "AHJ";

  return (
    <div className="py-2">
      <Breadcrumb>
        <BreadcrumbItem>
          <BreadcrumbLink as={Link} href="/system-management/projects">
            Projects
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink
            as={Link}
            href={`/system-management/projects/${projectId}`}
          >
            {fullAddress}
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink
            as={Link}
            href={`/system-management/projects/${projectId}/ahj`}
          >
            {title}
          </BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>
      <div className="flex justify-between items-center h-9">
        <h3 className="h3">{title}</h3>
      </div>
    </div>
  );
}

interface Props {
  initialProject: ProjectResponseDto;
}

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
  const { data: project } = useProjectQuery({
    projectId: initialProject.projectId,
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

  return (
    <>
      <PageHeader project={project} />
      {isLoading ? (
        <div className="flex justify-center">
          <Loader2 className="w-[40px] h-[40px] animate-spin" />
        </div>
      ) : (
        <div className="pb-4">
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
        </div>
      )}
    </>
  );
}
