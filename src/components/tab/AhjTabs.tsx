import AhjNoteHistories from "../ahj/AhjNoteHistories";
import OpenAhjFolderButton from "../OpenAhjFolderButton";
import CollapsibleSection from "../CollapsibleSection";
import { ProjectResponseDto } from "@/api/api-spec";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { transformProjectAssociatedRegulatoryBodyIntoArray } from "@/lib/ahj";
import AhjNoteForm from "@/components/form/AhjNoteForm";
import useAhjNoteQuery from "@/queries/useAhjNoteQuery";
import useNotFound from "@/hook/useNotFound";

interface AhjTabsContentProps {
  geoId: string;
  value: string;
}

function AhjTabsContent({ geoId, value }: AhjTabsContentProps) {
  const {
    data: ahjNote,
    isLoading: isAhjNoteQueryLoading,
    error: ahjNoteQueryError,
  } = useAhjNoteQuery(geoId);
  useNotFound(ahjNoteQueryError);

  if (isAhjNoteQueryLoading || ahjNote == null) {
    return null;
  }

  return (
    <TabsContent value={value} className="mt-2">
      <OpenAhjFolderButton
        className="w-full mb-2"
        geoId={geoId}
        ahjNote={ahjNote}
      />
      <div className="space-y-6">
        <section>
          <AhjNoteForm ahjNote={ahjNote} geoId={geoId} />
        </section>
        <CollapsibleSection title="History">
          <AhjNoteHistories geoId={geoId} />
        </CollapsibleSection>
      </div>
    </TabsContent>
  );
}

interface AhjTabsProps {
  project: ProjectResponseDto;
}

export default function AhjTabs({ project }: AhjTabsProps) {
  const projectAssociatedRegulatoryBodyArray =
    transformProjectAssociatedRegulatoryBodyIntoArray(
      project.projectAssociatedRegulatoryBody
    );

  return (
    <Tabs defaultValue={projectAssociatedRegulatoryBodyArray[0].type}>
      <TabsList>
        {projectAssociatedRegulatoryBodyArray.map((value) => (
          <TabsTrigger key={value.type} value={value.type}>
            {value.name}
          </TabsTrigger>
        ))}
      </TabsList>
      {projectAssociatedRegulatoryBodyArray.map((value) => (
        <AhjTabsContent
          key={value.type}
          geoId={value.geoId}
          value={value.type}
        />
      ))}
    </Tabs>
  );
}
