import React from "react";
import { Input } from "@/components/ui/input";
import RowItemsContainer from "@/components/RowItemsContainer";
import Minimap from "@/components/Minimap";
import ItemsContainer from "@/components/ItemsContainer";
import Item from "@/components/Item";
import { Label } from "@/components/ui/label";
import { OrganizationResponseDto } from "@/api";

interface Props {
  organization: OrganizationResponseDto;
}

export default function OrganizationForm({ organization }: Props) {
  return (
    <ItemsContainer>
      <RowItemsContainer>
        <Item>
          <Label>Name</Label>
          <Input value={organization.name} disabled />
        </Item>
        <Item>
          <Label>Email Address to Receive Invoice</Label>
          <Input value={organization.invoiceRecipientEmail ?? "-"} disabled />
        </Item>
        <Item>
          <Label>Phone Number</Label>
          <Input value={organization.phoneNumber ?? "-"} disabled />
        </Item>
      </RowItemsContainer>
      <div className="grid grid-cols-3 gap-2">
        <div className="flex flex-col gap-2">
          <Item>
            <Label>Address</Label>
            <Input
              value={organization.address.street1 ?? "-"}
              disabled
              placeholder="Street 1"
            />
            <Input
              value={organization.address.street2 ?? "-"}
              disabled
              placeholder="Street 2"
            />
            <Input
              value={organization.address.city ?? "-"}
              disabled
              placeholder="City"
            />
            <Input
              value={organization.address.state ?? "-"}
              disabled
              placeholder="State Or Region"
            />
            <Input
              value={organization.address.postalCode ?? "-"}
              disabled
              placeholder="Postal Code"
            />
            <Input
              value={organization.address.country ?? "-"}
              disabled
              placeholder="Country"
            />
          </Item>
        </div>
        <div className="col-span-2">
          <Minimap
            longitude={organization.address.coordinates[0]}
            latitude={organization.address.coordinates[1]}
          />
        </div>
      </div>
    </ItemsContainer>
  );
}
