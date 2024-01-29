"use client";
import React from "react";
import PageHeader from "@/components/PageHeader";
import PageLoading from "@/components/PageLoading";
import useNotFound from "@/hook/useNotFound";
import useOrganizationQuery from "@/queries/useOrganizationQuery";
import useClientNotesQuery from "@/queries/useClientNotesQuery";
import useClientNoteQuery from "@/queries/useClientNoteQuery";
import ClientNoteHistories from "@/components/client-notes/ClientNoteHistories";
import ClientNotesForm from "@/components/client-notes/ClientNotesForm";
import CollapsibleSection from "@/components/CollapsibleSection";

interface Props {
  params: {
    organizationId: string;
  };
}

export default function Page({ params: { organizationId } }: Props) {
  const {
    data: organization,
    isLoading: isOrganizationQueryLoading,
    error: organizationQueryError,
  } = useOrganizationQuery(organizationId);
  const {
    data: clientNotes,
    isLoading: isClientNotesQueryLoading,
    error: clientNotesQueryError,
  } = useClientNotesQuery({ organizationId });
  const {
    data: clientNote,
    isLoading: isClientNoteQueryLoading,
    error: clientNoteQueryError,
  } = useClientNoteQuery(clientNotes?.items[0].id ?? "", true);
  useNotFound(organizationQueryError);
  useNotFound(clientNotesQueryError);
  useNotFound(clientNoteQueryError);

  if (
    isOrganizationQueryLoading ||
    organization == null ||
    isClientNotesQueryLoading ||
    clientNotes == null ||
    isClientNoteQueryLoading ||
    clientNote == null
  ) {
    return <PageLoading />;
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        items={[
          { href: "/system-management/organizations", name: "Organizations" },
          {
            href: `/system-management/organizations/${organizationId}`,
            name: organization.name,
          },
          {
            href: `/system-management/organizations/${organizationId}/client-notes`,
            name: "Client Notes",
          },
        ]}
      />
      <div className="space-y-6">
        <section>
          <ClientNotesForm
            clientNote={clientNote}
            organizationId={organizationId}
          />
        </section>

        <CollapsibleSection title="History">
          <ClientNoteHistories organizationId={organizationId} />
        </CollapsibleSection>
      </div>
    </div>
  );
}
