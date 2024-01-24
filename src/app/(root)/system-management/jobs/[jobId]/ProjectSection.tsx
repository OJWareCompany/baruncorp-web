import Link from "next/link";
import { ProjectResponseDto } from "@/api";
import Item from "@/components/Item";
import ItemsContainer from "@/components/ItemsContainer";
import Minimap from "@/components/Minimap";
import RowItemsContainer from "@/components/RowItemsContainer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  project: ProjectResponseDto;
}

export default function ProjectSection({ project }: Props) {
  return (
    <section>
      <Link href={`/system-management/projects/${project.projectId}`}>
        <h2 className="h4 mb-2 underline inline-block">Project</h2>
      </Link>
      <ItemsContainer>
        <Item>
          <Label>Organization</Label>
          <Input value={project.clientOrganization} disabled />
        </Item>
        <RowItemsContainer>
          <Item>
            <Label>Property Type</Label>
            <Input value={project.propertyType} disabled />
          </Item>
          <Item>
            <Label>Property Owner</Label>
            <Input value={project.projectPropertyOwnerName ?? "-"} disabled />
          </Item>
          <Item>
            <Label>Project Number</Label>
            <Input value={project.projectNumber ?? "-"} disabled />
          </Item>
        </RowItemsContainer>
        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col gap-2">
            <Item>
              <Label>Address</Label>
              <Input
                value={project.propertyAddress.street1 ?? "-"}
                disabled
                placeholder="Street 1"
              />
              <Input
                value={project.propertyAddress.street2 ?? "-"}
                disabled
                placeholder="Street 2"
              />
              <Input
                value={project.propertyAddress.city ?? "-"}
                disabled
                placeholder="City"
              />
              <Input
                value={project.propertyAddress.state ?? "-"}
                disabled
                placeholder="State Or Region"
              />
              <Input
                value={project.propertyAddress.postalCode ?? "-"}
                disabled
                placeholder="Postal Code"
              />
              <Input
                value={project.propertyAddress.country ?? "-"}
                disabled
                placeholder="Country"
              />
            </Item>
          </div>
          <div className="col-span-2">
            <Minimap
              longitude={project.propertyAddress.coordinates[0]}
              latitude={project.propertyAddress.coordinates[1]}
            />
          </div>
        </div>
      </ItemsContainer>
    </section>
  );
}
