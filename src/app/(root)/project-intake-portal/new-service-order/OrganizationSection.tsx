"use client";

import {
  useNewServiceOrderData,
  useNewServiceOrderDataDispatch,
} from "./NewServiceOrderDataProvider";
import Item from "@/components/Item";
import OrganizationsCombobox from "@/components/combobox/OrganizationsCombobox";
import { Label } from "@/components/ui/label";

export default function OrganizationSection() {
  const { organizationId, isBarunCorpMember } = useNewServiceOrderData();
  const dispatch = useNewServiceOrderDataDispatch();

  return (
    <section>
      <Item>
        <Label>Organization</Label>
        <OrganizationsCombobox
          organizationId={organizationId}
          onOrganizationIdChange={(newOrganizationId) => {
            if (organizationId === newOrganizationId) {
              return;
            }

            dispatch({
              type: "SET_ORGANIZATION_ID",
              organizationId: newOrganizationId,
            });
          }}
          disabled={!isBarunCorpMember}
        />
      </Item>
    </section>
  );
}
