"use client";
import React from "react";
import { Input } from "@/components/ui/input";
import RowItemsContainer from "@/components/RowItemsContainer";
import Minimap from "@/components/Minimap";
import useOrganizationQuery from "@/queries/useOrganizationQuery";
import ItemsContainer from "@/components/ItemsContainer";
import Item from "@/components/Item";
import { Label } from "@/components/ui/label";
import PageHeader from "@/components/PageHeader";
import useProfileQuery from "@/queries/useProfileQuery";
import PageLoading from "@/components/PageLoading";

const title = "My Organization";

export default function Page() {
  /**
   * Query
   */
  const { data: profile, isLoading: isProfileQueryLoading } = useProfileQuery();
  const { data: organization, isLoading: isOrganizationQueryLoading } =
    useOrganizationQuery({
      organizationId: profile?.organizationId ?? "",
    });

  if (isProfileQueryLoading || isOrganizationQueryLoading) {
    return <PageLoading />;
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        items={[{ href: "/my/organization", name: title }]}
        title={title}
      />
      <ItemsContainer>
        <RowItemsContainer>
          <Item>
            <Label>Name</Label>
            <Input value={organization?.name ?? ""} readOnly />
          </Item>
          <Item>
            <Label>Email Address to Receive Invoice</Label>
            <Input value={organization?.email ?? ""} readOnly />
          </Item>
          <Item>
            <Label>Phone Number</Label>
            <Input value={organization?.phoneNumber ?? ""} readOnly />
          </Item>
        </RowItemsContainer>
        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col gap-2">
            <Item>
              <Label>Address</Label>
              <Input
                value={organization?.address.street1 ?? ""}
                readOnly
                placeholder="Street 1"
              />
              <Input
                value={organization?.address.street2 ?? ""}
                readOnly
                placeholder="Street 2"
              />
              <Input
                value={organization?.address.city ?? ""}
                readOnly
                placeholder="City"
              />
              <Input
                value={organization?.address.state ?? ""}
                readOnly
                placeholder="State Or Region"
              />
              <Input
                value={organization?.address.postalCode ?? ""}
                readOnly
                placeholder="Postal Code"
              />
              <Input
                value={organization?.address.country ?? ""}
                readOnly
                placeholder="Country"
              />
            </Item>
          </div>
          <div className="col-span-2">
            <Minimap
              longitude={organization?.address.coordinates[0]}
              latitude={organization?.address.coordinates[1]}
            />
          </div>
        </div>
      </ItemsContainer>
    </div>
  );
}
