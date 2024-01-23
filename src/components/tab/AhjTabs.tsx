import AhjNoteHistories from "../ahj/AhjNoteHistories";
import { ProjectResponseDto } from "@/api";
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
    <TabsContent value={value} className="mt-4">
      <div className="space-y-6">
        <section>
          <AhjNoteForm ahjNote={ahjNote} geoId={geoId} />
        </section>
        <section className="space-y-2">
          <h2 className="h4">History</h2>
          <AhjNoteHistories geoId={geoId} />
        </section>
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
