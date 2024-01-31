import React from "react";
import { LicenseResponseDto } from "@/api/api-spec";
import Item from "@/components/Item";
import RowItemsContainer from "@/components/RowItemsContainer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  license: LicenseResponseDto;
}

export default function LicenseForm({ license }: Props) {
  return (
    <RowItemsContainer>
      <Item>
        <Label>Type</Label>
        <Input value={license.type} disabled />
      </Item>
      <Item>
        <Label>State</Label>
        <Input value={license.state} disabled />
      </Item>
      <Item>
        <Label>Abbreviation</Label>
        <Input value={license.abbreviation} disabled />
      </Item>
    </RowItemsContainer>
  );
}
