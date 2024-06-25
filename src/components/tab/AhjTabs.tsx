import AhjNoteHistories from "../ahj/AhjNoteHistories";
import OpenAhjFolderButton from "../OpenAhjFolderButton";
import CollapsibleSection from "../CollapsibleSection";
import AhjNoteChangeSheet from "../ahj/AhjNoteChangeSheet";
import { ProjectResponseDto } from "@/api/api-spec";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ProjectAssociatedRegulatoryBody,
  getOriginProjectAssociatedRegulatoryBody,
  transformProjectAssociatedRegulatoryBodyIntoArray,
  transformProjectAssociatedRegulatoryBodyIntoArrayV2,
} from "@/lib/ahj";
import AhjNoteForm from "@/components/form/AhjNoteForm";
import useAhjNoteQuery from "@/queries/useAhjNoteQuery";
import useNotFound from "@/hook/useNotFound";

interface AhjTabsContentProps {
  projectId: string;
  originProjectAssociatedRegulatoryBody: ProjectAssociatedRegulatoryBody;
  geoId: string;
  value: string;
  typeName: string;
}

function AhjTabsContent({
  projectId,
  originProjectAssociatedRegulatoryBody,
  geoId,
  value,
  typeName,
}: AhjTabsContentProps) {
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
      <div className="flex gap-2">
        <AhjNoteChangeSheet
          projectId={projectId}
          originProjectAssociatedRegulatoryBody={
            originProjectAssociatedRegulatoryBody
          }
          typeName={typeName}
        />
        {!!geoId && (
          <OpenAhjFolderButton
            className="w-auto mb-2"
            geoId={geoId}
            ahjNote={ahjNote}
          />
        )}
      </div>
      <div className="space-y-6">
        {!!geoId ? (
          <>
            <section>
              <AhjNoteForm ahjNote={ahjNote} geoId={geoId} />
            </section>
            <CollapsibleSection title="History">
              <AhjNoteHistories geoId={geoId} />
            </CollapsibleSection>
          </>
        ) : (
          <div className="space-y-6">{`Not Found ${typeName} Note`}</div>
        )}
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

  const projectAssociatedRegulatoryBodyArrayV2 =
    transformProjectAssociatedRegulatoryBodyIntoArrayV2(
      project.projectAssociatedRegulatoryBody
    );

  const originProjectAssociatedRegulatory =
    getOriginProjectAssociatedRegulatoryBody(
      project.projectAssociatedRegulatoryBody
    );

  return (
    <Tabs defaultValue={projectAssociatedRegulatoryBodyArray[0].type}>
      <TabsList>
        {projectAssociatedRegulatoryBodyArrayV2.map((value) => (
          <TabsTrigger key={value.type} value={value.type}>
            {value.name}
          </TabsTrigger>
        ))}
      </TabsList>
      {projectAssociatedRegulatoryBodyArrayV2.map((value) => (
        <AhjTabsContent
          key={value.type}
          projectId={project.projectId}
          originProjectAssociatedRegulatoryBody={
            originProjectAssociatedRegulatory
          }
          geoId={value.geoId}
          value={value.type}
          typeName={value.name}
        />
      ))}
    </Tabs>
  );
}
