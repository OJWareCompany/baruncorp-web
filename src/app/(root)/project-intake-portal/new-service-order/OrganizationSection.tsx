"use client";
import { useProfileContext } from "../../ProfileProvider";
import {
  useNewServiceOrderData,
  useNewServiceOrderDataDispatch,
} from "./NewServiceOrderDataProvider";
import Item from "@/components/Item";
import OrganizationsCombobox from "@/components/combobox/OrganizationsCombobox";
import { Label } from "@/components/ui/label";

export default function OrganizationSection() {
  const { selectedOrganizationId } = useNewServiceOrderData();
  const dispatch = useNewServiceOrderDataDispatch();
  const { isBarunCorpMember } = useProfileContext();

  return (
    <section>
      <Item>
        <Label>Organization</Label>
        <OrganizationsCombobox
          organizationId={selectedOrganizationId}
          onOrganizationIdChange={(newOrganizationId) => {
            if (selectedOrganizationId === newOrganizationId) {
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
