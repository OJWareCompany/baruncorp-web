import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { useSession } from "next-auth/react";
import { ProjectResponseDto } from "@/api/api-spec";
import Item from "@/components/Item";
import ItemsContainer from "@/components/ItemsContainer";
import Minimap from "@/components/Minimap";
import RowItemsContainer from "@/components/RowItemsContainer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CollapsibleSection from "@/components/CollapsibleSection";
import { Button } from "@/components/ui/button";
import UtilitiesCombobox from "@/components/combobox/UtilitiesCombobox";

interface Props {
  project: ProjectResponseDto;
  pageType: PageType;
}

function getProjectDetailUrl({ pageType, project }: Props) {
  switch (pageType) {
    case "HOME":
      return `/projects/${project.projectId}`;
    case "WORKSPACE":
      return `/workspace/projects/${project.projectId}`;
    case "SYSTEM_MANAGEMENT":
      return `/system-management/projects/${project.projectId}`;
  }
}

export default function ProjectSection({ pageType, project }: Props) {
  const { data: session } = useSession();

  const isBarunCorpMember = session?.isBarunCorpMember ?? false;
  const isHome = pageType === "HOME";

  /**
   * 바른코프 멤버 ✅
   * 바른코프 멤버아닌데, 홈 ❌
   * 바른코프 멤버아닌데, 워크스페이스 ✅
   */
  const notForClient = isBarunCorpMember || !isHome;

  return (
    <CollapsibleSection
      title="Project"
      action={
        notForClient && (
          <Link href={getProjectDetailUrl({ pageType, project })}>
            <Button
              variant={"outline"}
              size={"sm"}
              className="h-[28px] text-xs px-2"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              View Detail
            </Button>
          </Link>
        )
      }
    >
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
    </CollapsibleSection>
  );
}
