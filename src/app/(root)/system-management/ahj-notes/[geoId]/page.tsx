"use client";
import useAhjNoteQuery from "@/queries/useAhjNoteQuery";
import PageHeader from "@/components/PageHeader";
import PageLoading from "@/components/PageLoading";
import AhjNoteForm from "@/components/form/AhjNoteForm";
import useNotFound from "@/hook/useNotFound";

interface Props {
  params: {
    geoId: string;
  };
}

export default function Page({ params: { geoId } }: Props) {
  const {
    data: ahjNote,
    isLoading: isAhjNoteQueryLoading,
    error: ahjNoteQueryError,
  } = useAhjNoteQuery(geoId);
  useNotFound(ahjNoteQueryError);

  if (isAhjNoteQueryLoading || ahjNote == null) {
    return <PageLoading />;
  }

  return (
    <div>
      <PageHeader
        items={[
          { href: "/system-management/ahj-notes", name: "AHJ Notes" },
          {
            href: `/system-management/ahj-notes/${geoId}`,
            name: ahjNote.general.name,
          },
        ]}
      />
      <AhjNoteForm ahjNote={ahjNote} geoId={geoId} />
    </div>
  );
}
