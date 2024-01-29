"use client";
import PositionForm from "./PositionForm";
import TasksTable from "./TasksTable";
import NewTaskDialog from "./NewTaskDialog";
import WorkersTable from "./WorkersTable";
import NewWorkerDialog from "./NewWorkerDialog";
import PageHeader from "@/components/PageHeader";
import usePositionQuery from "@/queries/usePositionQuery";
import useNotFound from "@/hook/useNotFound";
import PageLoading from "@/components/PageLoading";
import CollapsibleSection from "@/components/CollapsibleSection";

interface Props {
  params: {
    positionId: string;
  };
}

export default function Page({ params: { positionId } }: Props) {
  const {
    data: position,
    isLoading: isPositionQueryLoading,
    error: positionQueryError,
  } = usePositionQuery(positionId);
  useNotFound(positionQueryError);

  if (isPositionQueryLoading || position == null) {
    return <PageLoading />;
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        items={[
          { href: "/system-management/positions", name: "Positions" },
          {
            href: `/system-management/positions/${positionId}}`,
            name: position.name,
          },
        ]}
      />
      <div className="space-y-6">
        <section>
          <PositionForm position={position} />
        </section>
        <CollapsibleSection
          title="Tasks"
          action={<NewTaskDialog position={position} />}
        >
          <TasksTable position={position} />
        </CollapsibleSection>
        <CollapsibleSection
          title="Workers"
          action={<NewWorkerDialog position={position} />}
        >
          <WorkersTable position={position} />
        </CollapsibleSection>
      </div>
    </div>
  );
}
