"use client";

import { useState } from "react";
import {
  useNewServiceOrderData,
  useNewServiceOrderDataDispatch,
} from "./NewServiceOrderDataProvider";
import NewProjectSheet from "./NewProjectSheet";
import JobsTable from "./JobsTable";
import ItemsContainer from "@/components/ItemsContainer";
import Item from "@/components/Item";
import { Label } from "@/components/ui/label";
import ExistingProjectCombobox from "@/components/combobox/ExistingProjectCombobox";
import { Button } from "@/components/ui/button";
import useProjectQuery from "@/queries/useProjectQuery";
import PageLoading from "@/components/PageLoading";
import { Input } from "@/components/ui/input";
import Minimap from "@/components/Minimap";
import UtilitiesCombobox from "@/components/combobox/UtilitiesCombobox";

export default function ProjectSection() {
  const [newProjectSheetOpen, setNewProjectSheetOpen] = useState(false);
  const { organizationId, projectId } = useNewServiceOrderData();
  const dispatch = useNewServiceOrderDataDispatch();
  const { data: project, isLoading: isProjectQueryLoading } =
    useProjectQuery(projectId);

  if (organizationId === "") {
    return;
  }

  return (
    <>
      <section>
        <h2 className="h4 mb-2">Project</h2>
        <ItemsContainer>
          <Item>
            <Label>Existing Project</Label>
            <ExistingProjectCombobox
              organizationId={organizationId}
              projectId={projectId}
              onProjectIdChange={(newProjectId) => {
                dispatch({
                  type: "SET_PROJECT_ID",
                  projectId: newProjectId,
                });
              }}
            />
            <Button
              variant={"outline"}
              onClick={() => {
                setNewProjectSheetOpen(true);
              }}
            >
              Project Not Found / This is New Project
            </Button>
          </Item>
          {projectId !== "" &&
            (isProjectQueryLoading || project == null ? (
              <PageLoading isPageHeaderPlaceholder={false} />
            ) : (
              <div className="grid grid-cols-3 gap-2">
                <ItemsContainer>
                  <Item>
                    <Label>Property Address</Label>
                    <Input
                      value={project.propertyAddress.fullAddress ?? ""}
                      disabled
                    />
                  </Item>
                  <Item>
                    <Label>Property Type</Label>
                    <Input value={project.propertyType ?? ""} disabled />
                  </Item>
                  <Item>
                    <Label>Property Owner</Label>
                    <Input
                      value={project.projectPropertyOwnerName ?? "-"}
                      disabled
                    />
                  </Item>
                  <Item>
                    <Label>Project Number</Label>
                    <Input value={project.projectNumber ?? "-"} disabled />
                  </Item>
                  <Item>
                    <Label>Utility</Label>
                    {project.utilityId == null ? (
                      <Input value="-" disabled />
                    ) : (
                      <UtilitiesCombobox
                        utilityId={project.utilityId}
                        onUtilityIdChange={() => {}}
                        state={project.propertyAddress.state}
                        disabled
                      />
                    )}
                  </Item>
                </ItemsContainer>
                <div className="col-span-2">
                  <Minimap
                    longitude={project.propertyAddress.coordinates[0]}
                    latitude={project.propertyAddress.coordinates[1]}
                  />
                </div>
              </div>
            ))}
        </ItemsContainer>
      </section>
      {projectId !== "" && project != null && (
        <section>
          <h2 className="h4 mb-2">Jobs Related to Project</h2>
          <ItemsContainer>
            <JobsTable data={project.jobs} />
          </ItemsContainer>
        </section>
      )}
      <NewProjectSheet
        open={newProjectSheetOpen}
        onOpenChange={setNewProjectSheetOpen}
        organizationId={organizationId}
        onProjectIdChange={(newProjectId) => {
          dispatch({
            type: "SET_PROJECT_ID",
            projectId: newProjectId,
          });
        }}
      />
    </>
  );
}
