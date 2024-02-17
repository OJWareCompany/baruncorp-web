"use client";
import PageHeader from "@/components/PageHeader";
import PageLoading from "@/components/PageLoading";
import useNotFound from "@/hook/useNotFound";
import UtilityNotesForm from "@/components/utility-notes/UtilityNotesForm";
import useUtilityQuery from "@/queries/useUtilityQuery";
import CollapsibleSection from "@/components/CollapsibleSection";
import UtilityNoteHistories from "@/components/utility-notes/UtilityNoteHistories";

interface Props {
  params: {
    utilityId: string;
  };
}

export default function Page({ params: { utilityId } }: Props) {
  const {
    data: utility,
    isLoading: isUtilityQueryLoading,
    error: utilityQueryError,
  } = useUtilityQuery(utilityId);
  useNotFound(utilityQueryError);

  if (isUtilityQueryLoading || utility == null) {
    return <PageLoading />;
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        items={[
          { href: "/system-management/utilities", name: "Utilities" },
          {
            href: `/system-management/utilities/${utilityId}`,
            name: utility.name,
          },
        ]}
      />
      <div className="space-y-6">
        <section>
          <UtilityNotesForm utility={utility} />
        </section>
        <CollapsibleSection title="History">
          <UtilityNoteHistories utilityId={utilityId} />
        </CollapsibleSection>
      </div>
    </div>
  );
}
