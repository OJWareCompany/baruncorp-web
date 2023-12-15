"use client";
import { Plus } from "lucide-react";
import { useState } from "react";
import OrganizationForm from "./OrganizationForm";
import UsersTable from "./UsersTable";
import NewUserByOrganizationSheet from "./NewUserByOrganizationSheet";
import PageHeaderAction from "./PageHeaderAction";
import PageHeader from "@/components/PageHeader";
import useOrganizationQuery from "@/queries/useOrganizationQuery";
import PageLoading from "@/components/PageLoading";
import { Button } from "@/components/ui/button";

interface Props {
  params: {
    organizationId: string;
  };
}

export default function Page({ params: { organizationId } }: Props) {
  const [newUserSheetOpen, setNewUserSheetOpen] = useState(false);

  const { data: organization, isLoading: isOrganizationQueryLoading } =
    useOrganizationQuery(organizationId);

  if (isOrganizationQueryLoading || organization == null) {
    return <PageLoading />;
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        <PageHeader
          items={[
            { href: "/system-management/organizations", name: "Organizations" },
            {
              href: `/system-management/organizations/${organizationId}`,
              name: organization.name,
            },
          ]}
          action={<PageHeaderAction organization={organization} />}
        />
        <div className="space-y-6">
          <section>
            <OrganizationForm organization={organization} />
          </section>
          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="h4">Users</h2>
              <Button
                variant={"outline"}
                size={"sm"}
                className="h-[28px] text-xs px-2"
                onClick={() => {
                  setNewUserSheetOpen(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                New User
              </Button>
            </div>
            <UsersTable organization={organization} />
          </section>
        </div>
      </div>
      <NewUserByOrganizationSheet
        open={newUserSheetOpen}
        onOpenChange={setNewUserSheetOpen}
        organizationId={organizationId}
      />
    </>
  );
}
