"use client";

import { useEffect, useState } from "react";
import { DialogProps } from "@radix-ui/react-dialog";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import RowItemsContainer from "@/components/RowItemsContainer";
import Minimap from "@/components/Minimap";
import useProjectQuery from "@/queries/useProjectQuery";
import { Button } from "@/components/ui/button";

import ProjectsByOrganizationCombobox from "@/components/combobox/ProjectsByOrganizationCombobox";
import Item from "@/components/Item";
import { Label } from "@/components/ui/label";
import ItemsContainer from "@/components/ItemsContainer";
import BaseTable from "@/components/table/BaseTable";
import { jobForProjectColumns } from "@/columns/job";

interface Props extends DialogProps {
  organizationId: string;
  onSelect: (newProjectId: string) => void;
}

export default function ExistingProjectSheet({
  organizationId,
  onSelect,
  ...dialogProps
}: Props) {
  /**
   * State
   */
  const [projectId, setProjectId] = useState("");

  /**
   * Query
   */
  const { data: project } = useProjectQuery({
    projectId,
  });

  /**
   * useEffect
   */
  useEffect(() => {
    setProjectId("");
  }, [organizationId]);

  return (
    <Sheet {...dialogProps}>
      <SheetContent className="sm:max-w-[1400px] w-full overflow-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>Existing Project</SheetTitle>
        </SheetHeader>
        <ItemsContainer>
          <Item>
            <Label>Property Address</Label>
            <ProjectsByOrganizationCombobox
              projectId={projectId}
              organizationId={organizationId}
              onSelect={(newProjectId) => {
                setProjectId(newProjectId);
              }}
              modal={true}
            />
          </Item>
          {projectId !== "" && (
            <>
              <RowItemsContainer>
                <Item>
                  <Label>Property Type</Label>
                  <Input value={project?.propertyType ?? ""} readOnly />
                </Item>
                <Item>
                  <Label>Property Owner</Label>
                  <Input
                    value={project?.projectPropertyOwnerName ?? ""}
                    readOnly
                  />
                </Item>
                <Item>
                  <Label>Project Number</Label>
                  <Input value={project?.projectNumber ?? ""} readOnly />
                </Item>
              </RowItemsContainer>
              <div className="w-full h-[400px]">
                <Minimap
                  longitude={project?.propertyAddress.coordinates[0]}
                  latitude={project?.propertyAddress.coordinates[1]}
                />
              </div>
              <BaseTable
                columns={jobForProjectColumns}
                data={project?.jobs ?? []}
                getRowId={({ id }) => id}
              />
              <RowItemsContainer>
                <Button
                  variant={"outline"}
                  onClick={() => {
                    dialogProps.onOpenChange?.(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    onSelect(projectId);
                    dialogProps.onOpenChange?.(false);
                    setProjectId("");
                  }}
                >
                  Select
                </Button>
              </RowItemsContainer>
            </>
          )}
        </ItemsContainer>
      </SheetContent>
    </Sheet>
  );
}
